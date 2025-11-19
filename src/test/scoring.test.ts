import { describe, it, expect } from "vitest";
import { mapLikert, computeTraitScores, classifyTraits } from "../lib/scoring";
import sampleQuiz from "../../data/quizzes/sample-quiz.json";
import traits from "../../data/traits.json";

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

		const scores = computeTraitScores(
			sampleQuiz as any,
			answers as any,
			traits as any
		);
		const classified = classifyTraits(scores, traits as any);

		// extraversion should be high (two questions sum positive)
		expect(classified["extraversion"]).toBe("high");
		// conscientiousness should be medium (0)
		expect(classified["conscientiousness"]).toBe("medium");
	});
});
