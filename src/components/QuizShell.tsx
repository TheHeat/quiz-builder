import React, { useState } from "react";
import { Quiz, Answer } from "../lib/types";
import QuestionRenderer from "./QuestionRenderer";

type Props = {
	quiz: Quiz;
	answers: Answer[];
	onAnswersUpdate: (a: Answer[]) => void;
	onFinish: () => void;
};

export default function QuizShell({
	quiz,
	answers,
	onAnswersUpdate,
	onFinish,
}: Props) {
	const [index, setIndex] = useState(0);

	function setAnswer(qId: string, value: number) {
		const next = answers.filter((a) => a.questionId !== qId);
		next.push({ questionId: qId, value });
		onAnswersUpdate(next);
	}

	const current = quiz.questions[index];

	function next() {
		if (index < quiz.questions.length - 1) setIndex(index + 1);
		else onFinish();
	}

	function prev() {
		if (index > 0) setIndex(index - 1);
	}

	return (
		<div>
			<div style={{ marginBottom: 12 }}>
				<strong>
					Question {index + 1} / {quiz.questions.length}
				</strong>
			</div>
			<QuestionRenderer
				question={current}
				onAnswer={setAnswer}
				selected={
					answers.find((a) => a.questionId === current.id)?.value ?? null
				}
			/>
			<div style={{ marginTop: 16 }}>
				<button
					onClick={prev}
					disabled={index === 0}
					style={{ marginRight: 8 }}
				>
					Back
				</button>
				<button onClick={next}>Next</button>
			</div>
		</div>
	);
}
