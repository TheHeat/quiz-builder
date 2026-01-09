import { Quiz, Trait, TraitScores, Answer, TraitScoresSummary } from "./types";

/**
 * Convert a Likert response into a centered numeric value.
 *
 * Example (default 1..5):
 * 1 -> -2, 3 -> 0, 5 -> +2
 */
export function mapLikert(value: number, min = 1, max = 5): number {
	const mid = (min + max) / 2;
	return value - mid;
}

/**
 * Compute averaged trait scores for a quiz (returns values in the quiz's
 * original scale).
 *
 * Behavior summary
 * - Only `likert` questions participate. Each answered likert response is
 *   converted to a centered mapped value via `mapLikert(value, scaleMin, scaleMax)`.
 * - For each trait we accumulate `sum += mapped * weight` and
 *   `weightSum += abs(weight)` across questions that reference that trait.
 * - The per-trait value returned is the weighted average converted back to
 *   the original input scale by adding the scale midpoint (and clamping to
 *   `[min,max]`). For example, with a 1..5 scale mapped values in [-2,+2]
 *   are converted back so callers receive numbers in the 1..5 range.
 * - Traits with no contributing answers return the neutral midpoint value
 *   (e.g. 3 for a 1..5 scale) and are excluded from the average-of-traits
 *   computation.
 * - `TraitScoresSummary` fields:
 *   - `traitScores`: per-trait values on the original quiz scale.
 *   - `average`: arithmetic mean of all non-missing per-trait values (original scale).
 *   - `overall` (optional): when `options.includeOverall` is true, a weighted
 *     average across all answered likert questions (returned on the original scale).
 */
export function computeTraitScores(
	quiz: Quiz,
	answers: Answer[],
	traits: Trait[],
	options?: { includeOverall?: boolean }
): TraitScoresSummary {
	// Fast lookup of answers by question id
	const answerMap = new Map(answers.map((a) => [a.questionId, a.value]));

	// Accumulators per trait
	const traitScoreSums = new Map<string, number>();
	const traitWeightSums = new Map<string, number>();

	const scaleMin = quiz.scale?.min ?? 1;
	const scaleMax = quiz.scale?.max ?? 5;

	for (const q of quiz.questions) {
		const raw = answerMap.get(q.id);
		if (raw == null) continue; // unanswered
		if (q.type !== "likert") continue; // only likert items participate

		const v = Number(raw);
		const mapped = mapLikert(v, scaleMin, scaleMax);

		if (!q.trait_weights) continue;
		for (const tw of q.trait_weights) {
			// reverse-coded items flip the sign
			const effective = tw.reverse ? -mapped : mapped;

			const prev = traitScoreSums.get(tw.traitId) ?? 0;
			// missing weight defaults to 1
			const w = tw.weight ?? 1;
			traitScoreSums.set(tw.traitId, prev + effective * w);

			const wPrev = traitWeightSums.get(tw.traitId) ?? 0;
			// use absolute weight when normalizing so negative weights don't cancel
			traitWeightSums.set(tw.traitId, wPrev + Math.abs(w));
		}
	}

	// Build result object in the original quiz scale (e.g. 1..5)
	const result: TraitScores = {};
	const includedTraitValues: number[] = [];
	const mid = (scaleMin + scaleMax) / 2;
	const clamp = (v: number) => Math.max(scaleMin, Math.min(scaleMax, v));

	for (const t of traits) {
		const sum = traitScoreSums.get(t.id) ?? 0;
		const weightSum = traitWeightSums.get(t.id) ?? 0;
		if (weightSum > 0) {
			// compute mapped average then convert back to original scale
			const mappedAvg = sum / weightSum;
			const displayVal = clamp(mappedAvg + mid);
			result[t.id] = displayVal;
			includedTraitValues.push(displayVal);
		} else {
			// no contributors -> neutral midpoint
			result[t.id] = mid;
		}
	}

	// average of all non-missing trait scores (already in original scale)
	const average =
		includedTraitValues.length > 0
			? includedTraitValues.reduce((a, b) => a + b, 0) /
			  includedTraitValues.length
			: mid;

	const out: TraitScoresSummary = { traitScores: result, average };

	// Optionally compute an overall score across all likert answers
	if (options?.includeOverall) {
		// We'll compute an overall normalized score by aggregating per-question
		// mapped values (accounting for any weights on trait assignments).
		let totalWeighted = 0;
		let totalWeight = 0;
		for (const q of quiz.questions) {
			const raw = answerMap.get(q.id);
			if (raw == null) continue;
			if (q.type !== "likert") continue;
			const v = Number(raw);
			const mapped = mapLikert(v, scaleMin, scaleMax);

			// If the question has trait_weights, use the sum of absolute weights
			// as the question's contribution; otherwise treat it as weight 1.
			let qWeight = 0;
			if (q.trait_weights && q.trait_weights.length > 0) {
				qWeight = q.trait_weights.reduce(
					(acc, tw) => acc + Math.abs(tw.weight ?? 1),
					0
				);
			} else {
				qWeight = 1;
			}

			totalWeighted += mapped * qWeight;
			totalWeight += qWeight;
		}

		// overall is the weighted average of mapped values, converted back to
		// original scale by adding the midpoint and clamping
		const mappedOverall = totalWeight > 0 ? totalWeighted / totalWeight : 0;
		out.overall = clamp(mappedOverall + mid);
	}

	return out;
}

// Note: trait classification was removed in favor of displaying raw averaged
// trait scores. If you need bucketed labels again add a separate utility.

/**
 * Convert a score from the original scale to a 0-100 percentage.
 *
 * Example (1..5 scale):
 * 1 -> 0, 3 -> 50, 5 -> 100
 */
export function scoreToPercentage(value: number, min = 1, max = 5): number {
	const clamped = Math.max(min, Math.min(max, value));
	if (max === min) return 0;
	return ((clamped - min) / (max - min)) * 100;
}

/**
 * Convert a TraitScoresSummary into one where all scores are percentages (0-100).
 */
export function traitScoresToPercentages(
	summary: TraitScoresSummary,
	min = 1,
	max = 5
): TraitScoresSummary {
	const traitScores: TraitScores = {};
	for (const [k, v] of Object.entries(summary.traitScores)) {
		traitScores[k] = scoreToPercentage(v, min, max);
	}

	return {
		traitScores,
		average: scoreToPercentage(summary.average, min, max),
		overall:
			typeof summary.overall === "number"
				? scoreToPercentage(summary.overall, min, max)
				: undefined,
	};
}
