# market-pulse · site

Static, bilingual (Spanish by default, English at `/en/`) page built with [Astro](https://astro.build). It does not hold any data or copy of the story: it reads the files the pipeline produces and runs them through the same checks.

## Run it

From the repository root:

```bash
pnpm install
pnpm --dir site dev                       # http://localhost:4321
ALLOW_INCOMPLETE=1 pnpm --dir site build  # only while FRED data is incomplete
pnpm --dir site build                     # fails if validation did not pass
```

## Where things live

```
src/
├── pages/              Routes only: / (es) and /en/ (en). Each renders HomeView with its locale.
├── views/              One component per page. Loads the data and lays out the containers.
├── containers/         Sections of the page. Turn data + copy into props for UI components.
├── components/
│   ├── ui/             Small presentational pieces (StatFigure, Notice, Prose, LanguageToggle…).
│   ├── charts/         LineChart: SVG lines + HTML labels; works without JavaScript.
│   └── layout/         SiteHeader, SiteFooter.
├── layouts/            BaseLayout: <html>, <head>, fonts.
├── i18n/
│   ├── locales/        es.json, en.json: all the page's copy, one file per language.
│   ├── translations.ts getMessages(locale) and fill() for {placeholders}.
│   └── config.ts       Locales, default locale, routes.
├── lib/                Pure helpers, no UI.
│   ├── data/           loadSiteData: market data, data status and story, with the publish gate.
│   ├── story/          parseStory: splits the rendered story into title, dek and sections.
│   └── charts/         scales (geometry) and chartModels (data → what a chart draws).
├── scripts/            Client-side behavior (chart tooltip). The only JavaScript sent to the browser.
├── config/             Site constants (author, links) and the order of the "How I built it" phases.
├── styles/             tokens.css (colors, type, spacing; light and dark) and global.css.
└── types/              Types of market-data.json.
```

There is no `hooks/` folder: the site has no React or client framework, so there are no hooks. Client behavior lives in `src/scripts/`.

## Translations

Each language is one file in `src/i18n/locales/`. The site has a single page, so each file holds that page's copy. If pages are added, split each language into one file per page (`locales/<lang>/<page>.json`) and load it from that page's view.

The long-form story is not in these files: it comes from `research/STORY.template.md` (es) and `research/STORY.template.en.md` (en), rendered by the pipeline.

## Rules this site enforces

- **No number written by hand.** Every figure comes from `data/processed/market-data.json` through the pipeline's formatters (`@pipeline/render.ts`). The locale files are tested for hand-written digits (`tests/i18n.test.ts`), like the story templates.
- **Same checks as the pipeline.** The story is built at build time with `@pipeline/story.ts`: hand-written digits, unknown markers or a failed assertion stop the build.
- **No publishing with incomplete data.** A production build fails if validation did not pass or if the Yahoo cross-check has differences outside tolerance. `ALLOW_INCOMPLETE=1` builds a draft with a visible notice.
- **The browser never computes numbers.** Charts get pre-formatted values; the client script only shows them.

## Versions

Astro is pinned to `7.4.1`: later 7.4.x releases require Node ≥ 22.23.4. With a newer Node, it can be upgraded. `astro check` uses TypeScript 6 (it does not support TypeScript 7 yet).
