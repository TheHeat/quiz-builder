import { Quiz, Trait, TraitScores, Answer } from "./types";

export function mapLikert(value: number, min = 1, max = 5): number {
	const mid = (min + max) / 2;
	return value - mid;
}

export function computeTraitScores(
	quiz: Quiz,
	answers: Answer[],
	traits: Trait[]
): TraitScores {
	const answerMap = new Map(answers.map((a) => [a.questionId, a.value]));
	const traitScoreSums = new Map<string, number>();
	const traitWeightSums = new Map<string, number>();

	const scaleMin = quiz.scale?.min ?? 1;
	const scaleMax = quiz.scale?.max ?? 5;
	const maxMapped = Math.abs(mapLikert(scaleMax, scaleMin, scaleMax));

	for (const q of quiz.questions) {
		const raw = answerMap.get(q.id);
		if (raw == null) continue;
		if (q.type !== "likert") continue;
		const v = Number(raw);
		let mapped = mapLikert(v, scaleMin, scaleMax);

		if (!q.trait_weights) continue;
		for (const tw of q.trait_weights) {
			const effective = tw.reverse ? -mapped : mapped;
			const prev = traitScoreSums.get(tw.traitId) ?? 0;
			traitScoreSums.set(tw.traitId, prev + effective * tw.weight);
			const wPrev = traitWeightSums.get(tw.traitId) ?? 0;
			traitWeightSums.set(tw.traitId, wPrev + Math.abs(tw.weight));
		}
	}

	const result: TraitScores = {};
	for (const t of traits) {
		const sum = traitScoreSums.get(t.id) ?? 0;
		const weightSum = traitWeightSums.get(t.id) ?? 0;
		const denom = weightSum * maxMapped || 1;
		result[t.id] = sum / denom;
	}
	return result;
}

export function classifyTraits(
	scores: TraitScores,
	traits: Trait[]
): Record<string, "low" | "medium" | "high"> {
	const out: Record<string, "low" | "medium" | "high"> = {};
	for (const t of traits) {
		const s = scores[t.id] ?? 0;
		const low = t.thresholds?.low ?? -0.33;
		const high = t.thresholds?.high ?? 0.33;
		if (s <= low) out[t.id] = "low";
		else if (s >= high) out[t.id] = "high";
		else out[t.id] = "medium";
	}
	return out;
}
