import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Quiz, Answer, LadderAnswerValue } from "../lib/types";
import QuestionRenderer from "./QuestionRenderer";

type Props = {
	quiz: Quiz;
	answers: Answer[];
	onAnswersUpdate: (a: Answer[]) => void;
};

export default function QuizShell({ quiz, answers, onAnswersUpdate }: Props) {
	const [index, setIndex] = useState(0);
	const navigate = useNavigate();
	const { slug } = useParams();

	function setAnswer(qId: string, value: number | LadderAnswerValue) {
		const next = answers.filter((a) => a.questionId !== qId);
		next.push({ questionId: qId, value });
		onAnswersUpdate(next);
	}

	const current = quiz.questions[index];

	function next() {
		if (index < quiz.questions.length - 1) {
			setIndex(index + 1);
		} else {
			// Go to results page
			if (slug) {
				navigate(`/quiz/${slug}/results`);
			}
		}
	}

	// determine whether the current question has an answer
	const rawAnswer = answers.find((a) => a.questionId === current.id)?.value;
	const currentAnswer = rawAnswer ?? null;

	function isAnswered(value: Answer["value"]) {
		if (quiz.scoringType === "ladder") {
			return (
				value &&
				typeof value === "object" &&
				value !== null &&
				typeof (value as LadderAnswerValue).current === "number" &&
				typeof (value as LadderAnswerValue).future === "number"
			);
		}
		if (value === null || value === undefined) return false;
		if (Array.isArray(value)) return value.length > 0;
		if (typeof value === "string") return value.trim().length > 0;
		return true; // numbers and other truthy values
	}

	const canProceed = isAnswered(currentAnswer);

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
				selected={rawAnswer ?? null}
				quizScale={quiz.scale}
				scoringType={quiz.scoringType}
				ladderLabels={quiz.ladderLabels}
			/>
			<div style={{ marginTop: 16 }}>
				<button
					onClick={prev}
					disabled={index === 0}
					style={{ marginRight: 8 }}
				>
					Back
				</button>
				<button
					onClick={next}
					disabled={!canProceed}
				>
					Next
				</button>
			</div>
		</div>
	);
}
