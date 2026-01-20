import { Quiz, Trait, TraitScores, Answer, TraitScoresSummary } from "./types";

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
	options?: { includeOverall?: boolean },
): TraitScoresSummary {
	if (quiz.scoringType === "ladder") {
		return scoreLadderQuiz(quiz, answers, traits, options);
	} else {
		return scoreLikertQuiz(quiz, answers, traits, options);
	}
}

// Internal: scores a standard Likert quiz
function scoreLikertQuiz(
	quiz: Quiz,
	answers: Answer[],
	traits: Trait[],
	options?: { includeOverall?: boolean },
): TraitScoresSummary {
	const answerMap = new Map(answers.map((a) => [a.questionId, a.value]));
	const traitScoreSums = new Map<string, number>();
	const traitWeightSums = new Map<string, number>();
	const scaleMin = quiz.scale?.min ?? 1;
	const scaleMax = quiz.scale?.max ?? 5;
	const mid = (scaleMin + scaleMax) / 2;
	const clamp = (v: number) => Math.max(scaleMin, Math.min(scaleMax, v));

	for (const q of quiz.questions) {
		const raw = answerMap.get(q.id);
		if (raw == null) continue;
		if (q.type !== "likert") continue;
		const mapped = Number(raw);
		if (!q.trait_weights) continue;
		for (const tw of q.trait_weights) {
			const effective = tw.reverse ? -mapped : mapped;
			const prev = traitScoreSums.get(tw.traitId) ?? 0;
			const w = tw.weight ?? 1;
			traitScoreSums.set(tw.traitId, prev + effective * w);
			const wPrev = traitWeightSums.get(tw.traitId) ?? 0;
			traitWeightSums.set(tw.traitId, wPrev + Math.abs(w));
		}
	}

	const result: TraitScores = {};
	const includedTraitValues: number[] = [];
	for (const t of traits) {
		const sum = traitScoreSums.get(t.id) ?? 0;
		const weightSum = traitWeightSums.get(t.id) ?? 0;
		if (weightSum > 0) {
			const mappedAvg = sum / weightSum;
			const displayVal = clamp(mappedAvg + mid);
			result[t.id] = displayVal;
			includedTraitValues.push(displayVal);
		} else {
			result[t.id] = mid;
		}
	}
	const average =
		includedTraitValues.length > 0
			? includedTraitValues.reduce((a, b) => a + b, 0) /
				includedTraitValues.length
			: mid;
	const out: TraitScoresSummary = { traitScores: result, average };
	if (options?.includeOverall) {
		let totalWeighted = 0;
		let totalWeight = 0;
		for (const q of quiz.questions) {
			const raw = answerMap.get(q.id);
			if (raw == null) continue;
			if (q.type !== "likert") continue;
			const mapped = Number(raw);
			let qWeight = 0;
			if (q.trait_weights && q.trait_weights.length > 0) {
				qWeight = q.trait_weights.reduce(
					(acc, tw) => acc + Math.abs(tw.weight ?? 1),
					0,
				);
			} else {
				qWeight = 1;
			}
			totalWeighted += mapped * qWeight;
			totalWeight += qWeight;
		}
		const mappedOverall = totalWeight > 0 ? totalWeighted / totalWeight : 0;
		out.overall = clamp(mappedOverall);
	}
	return out;
}

/**
 * Internal: Scores a ladder-type quiz.
 *
 * For each likert question, expects an answer object with `current` and `future` values.
 * Each value is mapped to a 0-100 percentage, and the trait score is the signed difference (future - current).
 *
 * - For each trait, accumulates weighted differences across all relevant questions.
 * - Per-trait score is the weighted average of these differences (percentage difference).
 * - Traits with no contributing answers return 0.
 * - The `average` is the mean of all non-missing per-trait values.
 * - If `options.includeOverall` is true, computes a weighted average across all answered likert questions.
 *
 * @param quiz The quiz definition (must be ladder scoring type)
 * @param answers The user's answers
 * @param traits The list of traits
 * @param options Optional scoring options
 * @returns TraitScoresSummary with per-trait and overall scores
 */
function scoreLadderQuiz(
	quiz: Quiz,
	answers: Answer[],
	traits: Trait[],
	options?: { includeOverall?: boolean },
): TraitScoresSummary {
	// Split answers into current and future sets
	const currentAnswers: Answer[] = [];
	const futureAnswers: Answer[] = [];
	for (const a of answers) {
		if (
			typeof a.value === "object" &&
			a.value !== null &&
			"current" in a.value &&
			"future" in a.value
		) {
			currentAnswers.push({ ...a, value: a.value.current });
			futureAnswers.push({ ...a, value: a.value.future });
		}
	}

	// Use scoreLikertQuiz to get trait scores for current and future
	const currentScores = scoreLikertQuiz(quiz, currentAnswers, traits);
	const futureScores = scoreLikertQuiz(quiz, futureAnswers, traits);

	// Instead of difference, return both current and future scores for each trait
	const traitScores: Record<string, { current: number; future: number }> = {};
	const includedTraitValues: number[] = [];
	for (const t of traits) {
		const current = currentScores.traitScores[t.id] ?? 0;
		const future = futureScores.traitScores[t.id] ?? 0;
		traitScores[t.id] = { current, future };
		includedTraitValues.push(current, future);
	}
	// Average of all non-missing trait scores (current and future)
	const average =
		includedTraitValues.length > 0
			? includedTraitValues.reduce((a, b) => a + b, 0) /
				includedTraitValues.length
			: 0;

	// Get ladder labels from quiz definition, fallback to defaults
	const ladderLabels = quiz.ladderLabels ?? ["Current", "Future"];

	// Optionally compute an overall score across all likert answers
	let overall: { current: number; future: number } | undefined = undefined;
	if (options?.includeOverall) {
		const currentOverall =
			typeof currentScores.overall === "number" ? currentScores.overall : 0;
		const futureOverall =
			typeof futureScores.overall === "number" ? futureScores.overall : 0;
		overall = { current: currentOverall, future: futureOverall };
	}

	// Return both scores and labels for UI
	return {
		traitScores,
		average,
		ladderLabels,
		overall,
	} as any;
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
	max = 5,
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
