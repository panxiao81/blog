---
name: Xiao Pan
description: Plain multilingual writing.
colors:
  carbon-ink: "#18181b"
  porcelain-surface: "#ffffff"
  soft-hover: "#f4f4f5"
  line-subtle: "#e4e4e7"
  body-slate: "#3f3f46"
  quiet-caption: "#71717a"
  night-surface: "#09090b"
  night-field: "#18181b"
  night-copy: "#f4f4f5"
  night-border: "#27272a"
  signal-amber: "#92400e"
  signal-amber-bg: "#fffbeb"
typography:
  display:
    fontFamily: "system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: 1.11
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.33
    letterSpacing: "-0.025em"
  title:
    fontFamily: "system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.56
  body:
    fontFamily: "system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.43
    letterSpacing: "0.2em"
rounded:
  sm: "4px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.carbon-ink}"
    textColor: "{colors.porcelain-surface}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.body-slate}"
  button-secondary:
    backgroundColor: "{colors.porcelain-surface}"
    textColor: "{colors.body-slate}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  button-secondary-hover:
    backgroundColor: "{colors.soft-hover}"
  input-search:
    backgroundColor: "{colors.porcelain-surface}"
    textColor: "{colors.carbon-ink}"
    rounded: "{rounded.sm}"
    padding: "4px 8px"
  nav-link:
    backgroundColor: "{colors.porcelain-surface}"
    textColor: "{colors.body-slate}"
    padding: "0"
  banner-consent:
    backgroundColor: "{colors.porcelain-surface}"
    textColor: "{colors.body-slate}"
    rounded: "{rounded.sm}"
    padding: "16px 24px"
  notice-translation:
    backgroundColor: "{colors.signal-amber-bg}"
    textColor: "{colors.signal-amber}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
---

# Design System: Xiao Pan

## Overview

**Creative North Star: "The Precise Notebook"**

This system is a text-first monochrome interface with technical crispness and almost no theatrical styling. The page should read like a deliberately kept notebook: clear page edges, strong typographic hierarchy, quiet controls, and just enough state treatment to keep navigation, search, and consent readable without competing with the writing.

The visual language rejects the feel of a SaaS template. There are no gradients, no dashboard-like cards, no growth-product accents, and no decorative brand gestures trying to manufacture personality. Personality comes from precision, multilingual care, and the confidence to let plain surfaces stay plain.

**Key Characteristics:**
- Author-first hierarchy with writing before interface chrome.
- Carbon-and-porcelain neutrals as the default visual voice.
- One sans-serif family doing all the work through scale, weight, and tracking.
- Flat reading surfaces with utility lift reserved for overlays and temporary UI.
- Low-distraction controls that stay readable in light and dark mode.

## Colors

The palette is a carbon-and-porcelain neutral scale with one warm disclosure note.

### Primary
- **Carbon Ink** (`#18181b`): The anchor color for site identity, strong headings, primary actions, and dark-field controls. Use it when the interface needs certainty, not decoration.

### Tertiary
- **Signal Amber** (`#92400e`): Reserved for translation and disclosure messaging. It is not a brand accent and must not spread into general navigation or promotional emphasis.
- **Signal Amber Wash** (`#fffbeb`): The quiet background behind translation notices and similar one-off content advisories.

### Neutral
- **Porcelain Surface** (`#ffffff`): The default page and form surface. It keeps the reading field open and unforced.
- **Soft Hover** (`#f4f4f5`): Used for hover fills and light-mode support states that need separation without becoming cards.
- **Hairline** (`#e4e4e7`): The 1px divider and border color for headers, footers, fields, and long-form section breaks.
- **Body Slate** (`#3f3f46`): The main secondary text color for navigation, summaries, and interface copy that should stay readable but defer to headings.
- **Quiet Caption** (`#71717a`): Metadata, captions, and low-priority labels.
- **Night Surface** (`#09090b`): The dark-mode page background and deepest reading surface.
- **Night Field** (`#18181b`): Dark-mode filled controls and input backgrounds.
- **Night Copy** (`#f4f4f5`): The default light text on dark surfaces.
- **Night Border** (`#27272a`): Dark-mode dividers and field outlines.

**The One Warm Note Rule.** Warm color is for disclosure, not brand theater. If amber starts appearing in ordinary links, buttons, or headings, the system has lost its restraint.

## Typography

**Display Font:** `system-ui, sans-serif`
**Body Font:** `system-ui, sans-serif`
**Label/Mono Font:** No separate label or mono family. Labels stay in the same sans-serif voice.

**Character:** The typography is plain on purpose. One system sans family carries the whole interface, and hierarchy comes from size, weight, line height, and tracking instead of font swapping.

### Hierarchy
- **Display** (600, `2.25rem`, 1.11): Page-level headings such as the home intro and taxonomy titles. Keep them tight, direct, and short.
- **Headline** (600, `1.5rem`, 1.33): Post list titles, section leaders, and any secondary heading that still needs to feel authored.
- **Title** (600, `1.125rem`, 1.56): Site title, taxonomy links, and compact emphasis within navigation-heavy surfaces.
- **Body** (400, `1rem`, 1.75): Descriptions, summaries, and prose-adjacent interface copy. Long reading lines should stay within about 65 to 75 characters.
- **Label** (500, `0.875rem`, 1.43, `0.2em` tracking): Sparse uppercase markers such as section labels. Use this voice rarely and never as default scaffolding on every section.

**The Single Voice Rule.** Do not introduce a second display face or a mono UI voice just to signal "technical." Precision comes from composition, not costume.

**The Locale First Rule.** Any future font expansion must protect multilingual readability before it chases personality. Chinese, Japanese, and English text should feel equally intentional, not like one language got the real design and the others inherited fallback styling.

## Elevation

This system is flat by default. Depth comes from spacing, borders, and content order; shadows appear only when an overlay or temporary intervention needs to separate itself from the reading surface.

### Shadow Vocabulary
- **Utility Lift** (`0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)`): Used on the consent banner and similar temporary overlays that must sit above prose without becoming ornamental.

**The Overlay Only Rule.** If a static content section needs a shadow to read correctly, the layout is under-resolved.

## Components

### Buttons
- **Shape:** Gently curved edges (`4px radius`). Enough softness to stay human, not enough to feel bubbly.
- **Primary:** Carbon Ink fill (`#18181b`) with white text, `8px 16px` padding, and a compact `0.875rem` label scale.
- **Hover / Focus:** Hover deepens or lightens within the neutral palette only. Focus treatment should be crisp and visible, never glow-heavy.
- **Secondary / Ghost / Tertiary:** Secondary actions stay border-led or quiet-fill, usually white or near-white with dark text and a `#e4e4e7` stroke in light mode or `#27272a` in dark mode.

### Cards / Containers
- **Corner Style:** Usually none. Content lives in open stacks and bordered regions instead of boxed cards.
- **Background:** Plain page surfaces first, with temporary backgrounds only when state or disclosure demands them.
- **Shadow Strategy:** None at rest. Refer to Elevation for the overlay exception.
- **Border:** Standard separation uses 1px hairlines (`#e4e4e7` light, `#27272a` dark).
- **Internal Padding:** Most utility containers sit on `16px`, `24px`, or `40px` rhythm steps rather than dense nested padding.

### Inputs / Fields
- **Style:** White or dark-field background, 1px border, `4px` radius, compact padding (`4px 8px`), and no decorative inset effects.
- **Focus:** Clarity over flourish. Keep focus obvious, but do not add colored glows that would turn a search field into a product-marketing element.
- **Error / Disabled:** Not yet heavily systematized in code. When added, follow the translation-notice pattern of clear contrast and explicit status instead of subtle ambiguity.

### Navigation
- **Style:** Text-led navigation with `0.875rem` labels, underline-on-hover behavior, and muted body-slate default color.
- **Typography:** Navigation should feel like part of the reading surface, not a separate control panel.
- **Default / Hover / Active:** Default stays quiet, hover reveals intent with underline or neutral tone shift, active state uses weight or stronger contrast rather than color.
- **Mobile Treatment:** Navigation compresses cleanly, with temporary toggles staying visually lighter than the content they reveal.

### Translation Notice
- **Style:** Warm notice wash (`#fffbeb`) with amber copy (`#92400e`), 1px border, and `8px 12px` padding.
- **Purpose:** This is a disclosure component, not a callout card. It should read as careful metadata, not a banner competing with the article title.

## Do's and Don'ts

### Do:
- **Do** keep the default surface monochrome: white or near-black backgrounds, carbon headings, slate body copy, and 1px zinc borders.
- **Do** use the primary filled action style only when the interface is asking for a decision, as in consent acceptance or a similarly explicit commit moment.
- **Do** separate long-form sections with space and hairlines before you reach for containers.
- **Do** reserve uppercase tracked labels for occasional orientation, not as a repeated section habit.
- **Do** treat locale-aware readability as a design requirement, especially when changing type scale, line length, or future font stacks.

### Don't:
- **Don't** make the site feel like a SaaS template. No dashboard cards, no conversion-driven CTA styling, no gradients, no product-marketing hero tricks.
- **Don't** introduce a second display font or a mono UI layer just to signal technical credibility.
- **Don't** turn prose surfaces into nested panels or card grids when a stack with spacing and borders would read more clearly.
- **Don't** spread the amber disclosure palette into ordinary navigation, metadata, or buttons.
- **Don't** use shadows as routine separation. If everything is lifted, nothing is quiet.
