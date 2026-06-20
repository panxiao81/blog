import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import OpenAI from 'openai';

// Load OPENAI_* from the repo-root .env if present (it is gitignored). Wrapped so
// importing this module for tests, or running without a .env, stays harmless.
const envPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '.env');
try {
  process.loadEnvFile(envPath);
} catch {
  // No .env file — rely on the ambient environment instead.
}

// Mirrors src/config/site.ts. Kept inline because this is a plain Node script and
// importing the TypeScript config would need a build step.
const LOCALES = ['en', 'zh', 'ja'];
const DEFAULT_LOCALE = 'zh';
const LANGUAGE_NAMES = {
  en: 'English',
  zh: 'Simplified Chinese',
  ja: 'Japanese',
};

// Per-locale register guidance. The source posts have a relaxed, first-person
// voice; these notes keep that tone instead of defaulting to a formal translation.
// Japanese in particular should avoid stiff 敬語 — this is a casual personal blog.
const LOCALE_STYLE = {
  en: 'Write in a relaxed, conversational personal-blog voice. Contractions are fine; keep it informal and first-person, not academic, corporate, or press-release-like.',
  ja: 'Write in a relaxed, casual personal-blog voice. Prefer plain form (常体・だ/である調) or a light conversational tone; avoid stiff honorifics (敬語) and overly formal です・ます phrasing. Read like a personal tech blog, not a manual or press release.',
};

function styleNote(locale) {
  const base =
    'Keep the original casual, conversational, first-person tone — do not make the writing more formal than the source.';
  const extra = LOCALE_STYLE[locale];

  return extra ? `${base} ${extra}` : base;
}

const DEFAULT_MODEL = process.env.OPENAI_MODEL ?? 'gpt-5.4-mini';

function parseArgs(argv) {
  const positional = [];
  const options = { overwrite: false, dryRun: false };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--overwrite') {
      options.overwrite = true;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--from') {
      options.from = argv[(i += 1)];
    } else if (arg === '--to') {
      options.to = argv[(i += 1)];
    } else if (arg === '--model') {
      options.model = argv[(i += 1)];
    } else if (arg.startsWith('--')) {
      fail(`Unknown option: ${arg}`);
    } else {
      positional.push(arg);
    }
  }

  options.slug = positional[0];
  return options;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

const USAGE = `Usage: pnpm translate-post <slug> [options]

Translate a source post into the other locales with an LLM.

Options:
  --from <locale>    Source locale (default: ${DEFAULT_LOCALE})
  --to <locales>     Comma-separated target locales (default: every other locale)
  --model <model>    OpenAI model (default: $OPENAI_MODEL or ${DEFAULT_MODEL})
  --overwrite        Replace target files that already exist
  --dry-run          Print the translation instead of writing files

Environment:
  OPENAI_API_KEY     Required
  OPENAI_BASE_URL    Optional (for a compatible proxy/gateway)
  OPENAI_MODEL       Optional default model`;

// Split a Markdown file into its raw frontmatter block and the body that follows.
export function splitFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);

  if (!match) {
    throw new Error('Source post has no YAML frontmatter block.');
  }

  return { frontmatter: match[1], body: match[2] };
}

// Read the scalar value of a frontmatter key, stripping any surrounding quotes.
export function readField(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'));

  if (!match) {
    return undefined;
  }

  return match[1].trim().replace(/^["']|["']$/g, '');
}

// Replace (or insert) a frontmatter scalar, quoting the value as a JSON string so
// colons and other YAML-significant characters stay safe.
export function setField(frontmatter, key, value) {
  const line = `${key}: ${JSON.stringify(value)}`;
  const pattern = new RegExp(`^${key}:.*$`, 'm');

  if (pattern.test(frontmatter)) {
    return frontmatter.replace(pattern, line);
  }

  return `${frontmatter}\n${line}`;
}

// Co-located assets live next to the source post (./<slug>/images/...). A
// translation in another locale's directory reaches them via ../<sourceLocale>/.
export function rewriteAssetPaths(body, fromLocale) {
  return body
    .replaceAll('](./', `](../${fromLocale}/`)
    .replaceAll('src="./', `src="../${fromLocale}/`);
}

// Some OpenAI-compatible gateways drop the system role for non-OpenAI models
// (e.g. Anthropic), so the instructions silently vanish. Folding them into the
// single user message keeps the prompt intact across every model we target.
async function translateText(client, model, instructions, text) {
  const completion = await client.chat.completions.create({
    model,
    messages: [{ role: 'user', content: `${instructions}\n\n${text}` }],
  });

  const content = completion.choices[0]?.message?.content;

  if (!content) {
    throw new Error('Model returned an empty response.');
  }

  return content.trim();
}

// Pull the first balanced JSON object out of a model reply, tolerating code
// fences or stray prose around it instead of demanding a strict JSON body.
function extractJsonObject(content) {
  const start = content.indexOf('{');
  const end = content.lastIndexOf('}');

  if (start === -1 || end === -1 || end < start) {
    throw new Error(`Model response did not contain a JSON object: ${content.slice(0, 80)}`);
  }

  return JSON.parse(content.slice(start, end + 1));
}

async function translateMetadata(client, model, targetLanguage, tone, title, description) {
  const instructions = `You are a professional translator. Translate the given blog post metadata into ${targetLanguage}.
${tone}
Return ONLY a JSON object with "title" and "description" string fields.
Keep proper nouns, product names, and code identifiers unchanged. Do not add commentary.
If a field is empty, return it as an empty string.`;

  const payload = JSON.stringify({ title, description: description ?? '' });
  const completion = await client.chat.completions.create({
    model,
    messages: [{ role: 'user', content: `${instructions}\n\n${payload}` }],
  });

  const content = completion.choices[0]?.message?.content;

  if (!content) {
    throw new Error('Model returned an empty metadata response.');
  }

  return extractJsonObject(content);
}

async function translateBody(client, model, targetLanguage, tone, body) {
  const instructions = `You are a professional translator. Translate the Markdown blog post body into ${targetLanguage}.
${tone}
Rules:
- Output ONLY the translated Markdown. No explanations, no surrounding code fences.
- Preserve all Markdown structure: headings, lists, tables, blockquotes, and inline formatting.
- Do NOT translate or reformat fenced code blocks or inline code; leave their contents byte-for-byte.
- Keep every link and image URL/path exactly as-is. Translate link text and image alt text.
- Preserve HTML tags, math ($...$ and $$...$$), and Mermaid diagrams unchanged.
- Keep proper nouns, product names, and technical terms natural for ${targetLanguage} readers.`;

  return translateText(client, model, instructions, body);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (!options.slug) {
    fail(USAGE);
  }

  const fromLocale = options.from ?? DEFAULT_LOCALE;

  if (!LOCALES.includes(fromLocale)) {
    fail(`Unknown source locale: ${fromLocale} (expected one of ${LOCALES.join(', ')})`);
  }

  const targets = (options.to ? options.to.split(',').map((value) => value.trim()) : LOCALES).filter(
    (locale) => locale !== fromLocale,
  );

  for (const locale of targets) {
    if (!LOCALES.includes(locale)) {
      fail(`Unknown target locale: ${locale} (expected one of ${LOCALES.join(', ')})`);
    }
  }

  if (targets.length === 0) {
    fail('No target locales to translate into.');
  }

  if (!process.env.OPENAI_API_KEY) {
    fail('OPENAI_API_KEY is not set.');
  }

  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const postsDir = path.join(repoRoot, 'src', 'content', 'posts');

  const mdPath = path.join(postsDir, fromLocale, `${options.slug}.md`);
  const mdxPath = path.join(postsDir, fromLocale, `${options.slug}.mdx`);
  const sourcePath = existsSync(mdPath) ? mdPath : existsSync(mdxPath) ? mdxPath : null;

  if (!sourcePath) {
    fail(`Source post not found: ${path.relative(repoRoot, mdPath)}`);
  }

  const extension = path.extname(sourcePath);
  const raw = readFileSync(sourcePath, 'utf8');
  const { frontmatter, body } = splitFrontmatter(raw);
  const title = readField(frontmatter, 'title') ?? options.slug;
  const description = readField(frontmatter, 'description');

  const model = options.model ?? DEFAULT_MODEL;
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL,
  });

  console.error(`Translating "${options.slug}" from ${fromLocale} → ${targets.join(', ')} (${model})`);

  for (const locale of targets) {
    const targetPath = path.join(postsDir, locale, `${options.slug}${extension}`);

    if (existsSync(targetPath) && !options.overwrite) {
      console.error(`  ${locale}: exists, skipping (use --overwrite)`);
      continue;
    }

    const language = LANGUAGE_NAMES[locale];
    const tone = styleNote(locale);
    const metadata = await translateMetadata(client, model, language, tone, title, description);
    const translatedBody = await translateBody(client, model, language, tone, body);

    // Keep taxonomy terms, date, and license verbatim; only the prose changes and
    // the post is marked as machine-translated. JSON.stringify(true) yields an
    // unquoted `true`, so setField writes a valid YAML boolean.
    let nextFrontmatter = setField(frontmatter, 'title', metadata.title);
    if (description !== undefined || metadata.description) {
      nextFrontmatter = setField(nextFrontmatter, 'description', metadata.description ?? '');
    }
    nextFrontmatter = setField(nextFrontmatter, 'autoTranslated', true);

    const finalBody = rewriteAssetPaths(translatedBody, fromLocale);
    const output = `---\n${nextFrontmatter}\n---\n\n${finalBody}\n`;

    if (options.dryRun) {
      console.error(`  ${locale}: (dry run)\n`);
      process.stdout.write(output);
      process.stdout.write('\n');
      continue;
    }

    // A target locale may not have a posts directory yet (e.g. its first translation).
    mkdirSync(path.dirname(targetPath), { recursive: true });
    writeFileSync(targetPath, output, 'utf8');
    console.error(`  ${locale}: wrote ${path.relative(repoRoot, targetPath)}`);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => {
    fail(error instanceof Error ? error.message : String(error));
  });
}
