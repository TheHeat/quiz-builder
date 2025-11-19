export type LikertScale = {
	min: number;
	max: number;
	labels?: string[];
};

export type Trait = {
	id: string;
	name: string;
	description?: string;
	thresholds?: { low: number; high: number };
};

export type TraitWeight = {
	traitId: string;
	weight: number;
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
};

export type Answer = {
	questionId: string;
	value: number | string | string[] | null;
};

export type TraitScores = Record<string, number>;

export type Result = {
	quizId: string;
	scores: TraitScores;
	classified: Record<string, "low" | "medium" | "high">;
};
