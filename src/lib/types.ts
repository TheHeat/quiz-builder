export type LikertScale = {
	min: number;
	max: number;
	labels?: string[];
};

export type Trait = {
	id: string;
	name: string;
	description?: string;
};

export type TraitWeight = {
	traitId: string;
	weight?: number;
	reverse?: boolean;
};

export type Question = {
	id: string;
	text: string;
	type: "likert" | "single-choice" | "multi-choice" | "open";
	scale?: LikertScale;
	trait_weights?: TraitWeight[];
};

export type Quiz = {
	id: string;
	title: string;
	description?: string;
	scale?: LikertScale;
	questions: Question[];
	traits?: Trait[];
};

export type Answer = {
	questionId: string;
	value: number | string | string[] | null;
};

export type TraitScores = Record<string, number>;

export type TraitScoresSummary = {
	traitScores: TraitScores;
	/**
	 * Average of all non-missing trait scores (only traits with contributing
	 * answered items are included in the mean).
	 */
	average: number;
	/**
	 * Optional overall score computed across all likert questions in the quiz
	 * (only present when requested).
	 */
	overall?: number;
};

export type Result = {
	quizId: string;
	scores: TraitScores;
	average?: number;
	overall?: number;
};
