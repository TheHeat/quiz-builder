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

Migration note

- Existing quizzes that use a separate `traits.json` can be migrated by
  copying the array into the quiz file as `traits`. Optionally remove the
  separate `traits.json` file after verifying the app works.
