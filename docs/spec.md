# Blog v1 Spec

## Goal
Build a plain, multilingual personal blog in the JS/TS ecosystem using static-site generation. The site should prioritize writing, support English/Chinese/Japanese, and remain simple to author and maintain.

## Stack
- Framework: Astro
- Interactivity: React islands only when needed
- Deployment target: static hosting
- Styling: Tailwind only in v1
- Content: Markdown first, MDX as an escape hatch
- Repo shape: single repo

## Locales
- Supported locales: `en`, `zh`, `ja`
- Use those locale IDs consistently in code, content paths, and routes
- All public routes are locale-prefixed
- `/` redirects client-side using saved language preference first, then browser language
- Non-JS fallback for `/` points to `/zh/`

## Route model
- Home: `/{locale}/`
- Archive: `/{locale}/archive/`
- Posts: `/{locale}/posts/{slug}/`
- Tags: `/{locale}/tags/{term}/`
- Categories: `/{locale}/categories/{term}/`
- Series: `/{locale}/series/{term}/`
- About: `/{locale}/about/`
- Links: `/{locale}/links/`
- Privacy: filename-derived route in pages content, expected `/{locale}/privacy/`
- Paginated routes use clean page 1 and `/page/2/` onward

## Content organization
- Use `src/content/`
- Locale-first layout
- Posts use slug-only filenames
- Post slug comes from filename and is shared across locales
- Markdown `date` is the source of truth
- Default source-post locale is `zh` by convention

### Collections
- Typed schemas at build time
- Separate collections
- Generic translated static pages use a `pages` collection
- `About` is a special page type with shared layout and locale content files

## Writing model
- Default format: Markdown
- MDX enabled, but only as an explicit escape hatch
- Helper script should support creating new source posts only
  - Markdown by default
  - MDX via parameter
  - full frontmatter skeleton generated

## Frontmatter / schema expectations
### Posts
- Required enough for stable rendering and metadata
- `description` is optional
- If `description` is missing, metadata may fall back to excerpt/first paragraph
- `draft: boolean`
- `autoTranslated: boolean`
- `tags`, `categories`, `series` keep Hugo-style names
- Default license policy is CC BY-SA, overridable per post

### Taxonomy semantics
- `tags`: multiple normal
- `categories`: multiple normal
- `series`: conceptually single-per-post, but no brittle hard enforcement needed
- Tags, categories, and series are all first-class and locale-scoped

## Translation model
- Site chrome must be translated
- Posts may remain source-language only, but translated versions are supported
- Manual pre-publish translation workflow in v1
- Generated translated Markdown is written back into repo
- Auto-translated content starts as draft
- `autoTranslated=true` shows a textual note on list pages and post pages
- Human-reviewed translations can later become normal posts by metadata change

## Fallback and placeholders
- Home and Archive may include source-post placeholders for untranslated posts
- Placeholders are interleaved in date order
- Placeholders look like normal items with a small note naming the source language
- Clicking a placeholder goes directly to the source post
- Taxonomy pages do not use placeholders
- Empty taxonomy pages render an empty state, not 404

## Lists and page presentation
### Homepage
- Blog-first
- Paginated recent posts
- Very short intro blurb on page 1 only
- Intro comes from a locale-specific snippet file
- Post items show title, date, description/excerpt

### Archive
- Separate page from Home
- Denser list style
- Show title, date, taxonomy labels
- Include placeholders

### Taxonomy result pages
- Use homepage-style list presentation
- Headings include taxonomy type, e.g. `Tag: Linux`
- Taxonomy landing pages use a simple term list
- Simple built-in sorting is fine

## Post page behavior
- Single centered reading column
- Metadata near title includes:
  - date
  - tags
  - categories
  - series
  - translation notice when relevant
- Omit author name, reading time, and word count in v1
- TOC:
  - desktop sidebar style
  - mobile collapsed toggle
  - H2/H3 only
- End-of-post nav uses `Newer / Older`
- Navigation order follows current-locale publication order only
- No back-to-top control
- Show a copy button on code blocks
- Small footer license note on each post

## Markdown features
- GFM
- Syntax highlighting
- Math
- Mermaid
- Excerpt break support with `<!--more-->`
- Fallback excerpt is first paragraph

### Rendering choices
- Math should be pre-rendered at build time
- Mermaid may render client-side in v1
- Code blocks stay unwrapped with horizontal scroll
- Tables also use horizontal scroll
- Inline code styling should be subtle
- Code highlighting should follow the site theme

## Images and assets
- Normal Markdown image authoring
- Alt text lives in each locale’s Markdown content
- No caption system in v1
- Co-locate post assets when practical
- Shared/common asset fallback is allowed
- Shared image assets across locales are preferred when language-neutral

## About / Links / Privacy
### About
- Canonical page name is `About`
- Special page type for layout control
- Shared layout + locale-specific content files
- Markdown by default, MDX later if needed
- Content may differ meaningfully by locale

### Links
- Simple translated static page
- Same link set across locales
- Normal Markdown body content

### Privacy
- Fully translated page
- Normal Markdown body content
- Linked from footer only

## Navigation
### Desktop main navigation order
- Home
- Archive
- Tags
- Categories
- Series
- About
- Links
- More

### More menu
- Configurable dropdown in main navigation
- Shared link list across locales
- Labels translated via locale dictionaries
- Hide it when empty

### Mobile
- Collapse early rather than wrapping
- Keep only home/logo and search affordance visible
- Everything else goes in hamburger menu

## Search
- Use Google `site:` search
- Desktop search bar always visible
- Mobile search is collapsible
- Search results open in new tab
- Search only targets the new canonical domain

## Language and theme controls
### Locale switcher
- Dropdown menu
- Fixed order: `EN / 中文 / 日本語`
- Show selected state
- If equivalent post is missing, switch target goes to target locale homepage silently in v1

### Theme
- Three states:
  - light
  - dark
  - follow-system
- Small menu UI
- Text + icons
- Show selected state
- Persist preference in browser

## Typography
- System fonts only in v1
- Locale-aware font stacks are important
- Mixed-language inline content is expected, so page and inline `lang` handling matters

## Comments
- Use Utterances
- One shared thread per post across locales
- Stable comment key should be locale-agnostic pathname style:
  - `/posts/{slug}/`

## SEO / feeds / metadata
- Per-locale RSS feeds
- Full-content feeds
- RSS only in v1, no extra JSON feed/index
- Automatic sitemap
- Drafts excluded from all public outputs
- Basic SEO + JSON-LD
- Each real localized post is self-canonical
- `hreflang` only for real localized variants when derivable automatically
- Shared default OG image in v1
- Plain generated default OG image is acceptable
- New minimal icon set, abstract simple mark preferred
- Domain is required config with no baked-in default value

## Ads, analytics, consent
- Google Analytics on all pages
- AdSense in v1
- Ads only in bounded placements:
  - top/bottom zones on list pages
  - end of post
  - not inside article body
  - not above title
- Same ad behavior across locales
- Use a Google-compatible consent solution
- Localize consent UI in all locales
- Consent-required regions use restricted/default-denied behavior until choice
- Persist consent choice in browser local storage
- Users must be able to reopen privacy settings

## Footer
- Minimal footer only
- Includes:
  - copyright year range
  - Privacy
  - Privacy Settings
  - RSS

## Accessibility and performance
- Basic accessibility only in v1
- Performance should be good by default, not an optimization project
- No PWA/offline support

## Link behavior
- Internal links open in same tab
- External links open in new tab

## License
- Shared default license policy: CC BY-SA
- Presentation can be a translated label plus external CC link
- Per-post override supported

## Implementation notes
- Shared site structure/settings should live in one typed config module
- Locale dictionaries should hold translatable UI labels
- Main nav labels, theme menu, language menu, consent UI, and notices should all use the same locale-dictionary system
- Config should not hardcode a default canonical domain value

## Existing design artifacts
- Glossary/domain language: `CONTEXT.md`
