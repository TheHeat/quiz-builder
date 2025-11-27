import React from "react";
import { Question, LikertScale as LikertScaleType } from "../lib/types";
import LikertScale from "./LikertScale";

type Props = {
	question: Question;
	selected: number | null;
	onAnswer: (qId: string, value: number) => void;
	quizScale?: LikertScaleType;
};

export default function QuestionRenderer({
	question,
	selected,
	onAnswer,
	quizScale,
}: Props) {
	if (question.type === "likert") {
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

	return <p>Unsupported question type</p>;
}
