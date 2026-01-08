# Quiz Builder — Personality Test Template

Local-first React + Vite template for data-driven personality quizzes.

Quick start

```bash
npm install
npm run dev
```

Add a quiz by placing a JSON file in `data/quizzes/<quizId>.json` following the sample schema.

## Single-file quiz format

This project now supports a single-file format for quizzes. Instead of splitting
quiz metadata and trait definitions into separate files, place everything in one
JSON file located at `data/quizzes/<quizId>/quiz.json` (see
`data/quizzes/sample-quiz/quiz.json`).

Required/optional fields

- `id`, `title`, `questions` — core quiz fields.
- `scale` (optional) — likert scale definition (`min`, `max`, `labels`).
- `traits` (optional but recommended) — array of trait objects. Each trait
  should include `id`, `name`, and optionally `description`.

Scoring and display

- Trait thresholds and automatic classification are no longer used by the
  default scoring path. Instead, the app computes numeric averaged scores
  for each trait based on answered likert items and any configured
  `trait_weights` in questions.
- The scoring API returns trait values in the quiz's original scale
  (for example, 1..5). Internally the code works with centered mapped
  values to simplify reverse-coding and weighting, but `computeTraitScores`
  converts the results back to the original scale before returning.

If you relied on threshold-based classification previously, update your
quiz files or add a small utility that maps numeric scores to labels using
your own thresholds.

Why single-file?

- Easier authoring: keep traits and questions together for each quiz.
- Simpler imports: the app now reads `traits` from the quiz object (e.g.
  `quiz.traits`) when computing scores.

## Quizzes

Quizzes are data-driven JSON files placed under `data/quizzes/`.

- Single-file format: `data/quizzes/<quizId>/quiz.json` holds the full quiz
  definition (metadata, `questions`, optional `scale`, and `traits`).
- Core fields: `id`, `title`, `questions`.
- Optional fields: `scale` (e.g. `min`, `max`, `labels`), `traits` (array of
  trait objects with `id`, `name`, and optional `description`).
- Questions may include `trait_weights` to weight items when computing
  trait averages, and items that require reverse-coding should be marked
  appropriately in the question definition.

See `data/quizzes/sample-quiz/quiz.json` for an example.

## Volitional sheets

Volitional sheets are a lightweight data format used by the app's
`VolitionalSheetPage` to render structured prompts, items, or challenges.
Place sheets under `data/volitional-sheets/<sheetId>/sheet.json`.

- Typical contents: `id`, `title`, `sections` or `items`, and any
  presentation metadata the UI needs.
- These files are read at runtime (local-first) and rendered by the
  `VolitionalSheetPage` and related components. Use the existing
  `data/volitional-sheets/sample-sheet/sheet.json` as a template.

## Running locally

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## Deploying to GitHub Pages

You can deploy the built site (`dist` produced by `npm run build`) to
GitHub Pages in a few ways. Two simple options are described below.

1. Quick manual deploy using `gh-pages` (local push)

```bash
npm run build
npx gh-pages -d dist
```

This will publish the `dist` directory to the `gh-pages` branch. Install
`gh-pages` as a dev dependency if you want to add an npm script:

```bash
npm install --save-dev gh-pages
```

Add to `package.json`:

```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

Then run `npm run deploy`.

2. CI deploy using GitHub Actions (recommended for automated deploys)

Create a workflow (e.g. `.github/workflows/deploy.yml`) that builds and
pushes `dist` to GitHub Pages using `peaceiris/actions-gh-pages`. A minimal
workflow example:

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          node-version: "18"
      - run: npm ci
      - run: npm run build
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          publish_dir: ./dist
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

Notes:

- If your site is hosted at a path (not the repo root), set `base` in
  `vite.config.ts` accordingly.
- For personal or org pages (username.github.io), deploy from `main` or
  set the repository's Pages settings to use the `gh-pages` branch.

If you'd like, I can add a sample GitHub Actions workflow file to the
repo or create npm `deploy` scripts — tell me which option you prefer.
