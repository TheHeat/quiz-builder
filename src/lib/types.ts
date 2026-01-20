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
	/** When true, results should be displayed as 0-100 percentages */
	displayAsPercentage?: boolean;
	/** Scoring type: 'standard' (default) or 'ladder' */
	scoringType?: "standard" | "ladder";
	/** Custom labels for ladder scoring, defaults to ['Current', 'Future'] if not provided */
	ladderLabels?: [string, string];
};

/**
 * For ladder quizzes, value is an object with current and future values.
 * For standard quizzes, value is as before.
 */
export type LadderAnswerValue = {
	current: number;
	future: number;
};

export type Answer = {
	questionId: string;
	/**
	 * For standard quizzes: number | string | string[] | null
	 * For ladder quizzes: LadderAnswerValue
	 */
	value: number | string | string[] | null | LadderAnswerValue;
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

export type VolitionalOption = {
	id: string;
	label: string;
};

export type Scenario = {
	id: string;
	text: string;
	options: VolitionalOption[];
};

export type Category = {
	id: string;
	title: string;
	description?: string;
	scenarios: Scenario[];
};

export type VolitionalSheet = {
	id: string;
	title: string;
	description?: string;
	categories: Category[];
};

export type SelectedOption = {
	id: string;
	label: string;
};

export type VolitionalSheetResponse = {
	scenarioId: string;
	selectedOptions: SelectedOption[];
};
