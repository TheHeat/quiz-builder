import React from "react";
import LikertScale from "./LikertScale";

type Props = {
	question: Question;
	selected: number | LadderAnswerValue | null;
	onAnswer: (qId: string, value: number | LadderAnswerValue) => void;
	quizScale?: LikertScaleType;
	scoringType?: "standard" | "ladder";
	ladderLabels?: [string, string];
};

export default function QuestionRenderer({
	question,
	selected,
	onAnswer,
	quizScale,
	scoringType,
	ladderLabels,
}: Props) {
	if (question.type === "likert") {
		if (scoringType === "ladder") {
			// Ladder: render two Likert scales with custom or default labels
			const labels = ladderLabels ?? ["Current", "Future"];
			const value =
				selected &&
				typeof selected === "object" &&
				"current" in selected &&
				"future" in selected
					? (selected as LadderAnswerValue)
					: { current: null, future: null };
			return (
				<div>
					<p>{question.text}</p>
					<div style={{ marginBottom: 16 }}>
						<strong>{labels[0]}</strong>
						<LikertScale
							question={question}
							value={typeof value.current === "number" ? value.current : null}
							onChange={(v) => onAnswer(question.id, { ...value, current: v })}
							quizScale={quizScale}
							name={question.id + "-current"}
						/>
					</div>
					<div>
						<strong>{labels[1]}</strong>
						<LikertScale
							question={question}
							value={typeof value.future === "number" ? value.future : null}
							onChange={(v) => onAnswer(question.id, { ...value, future: v })}
							quizScale={quizScale}
							name={question.id + "-future"}
						/>
					</div>
				</div>
			);
		} else {
			// Standard: single Likert
			return (
				<div>
					<p>{question.text}</p>
					<LikertScale
						question={question}
						value={typeof selected === "number" ? selected : null}
						onChange={(v) => onAnswer(question.id, v)}
						quizScale={quizScale}
					/>
				</div>
			);
		}
	}
	return <p>Unsupported question type</p>;
}
