import { describe, it, expect } from "vitest";
import { mapLikert, computeTraitScores } from "../lib/scoring";
import sampleQuiz from "../../data/quizzes/sample-quiz/quiz.json";

describe("scoring", () => {
	it("maps likert correctly", () => {
		expect(mapLikert(1, 1, 5)).toBe(-2);
		expect(mapLikert(3, 1, 5)).toBe(0);
		expect(mapLikert(5, 1, 5)).toBe(2);
	});

	it("computes trait scores and classification", () => {
		const answers = [
			{ questionId: "q1", value: 5 }, // extraversion +2
			{ questionId: "q2", value: 4 }, // neuroticism +1
			{ questionId: "q3", value: 3 }, // conscientiousness 0
			{ questionId: "q4", value: 1 }, // extraversion reverse: raw 1 -> mapped -2 -> reverse => +2
			{ questionId: "q5", value: 4 },
			{ questionId: "q6", value: 5 },
		];

		const summary = computeTraitScores(
			sampleQuiz as any,
			answers as any,
			sampleQuiz.traits as any
		);
		const scores = summary.traitScores;

		// extraversion should be above midpoint (two positive contributions)
		const mid =
			((sampleQuiz.scale?.min ?? 1) + (sampleQuiz.scale?.max ?? 5)) / 2;
		expect(scores["extraversion"]).toBeGreaterThan(mid);
		// conscientiousness should be approximately midpoint (one neutral answer)
		expect(scores["conscientiousness"]).toBeCloseTo(mid, 5);
	});
});
