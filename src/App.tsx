import React, { useState } from "react";
import quizData from "../data/quizzes/mos-social-support/quiz.json";
import QuizShell from "./components/QuizShell";
import ResultSummary from "./components/ResultSummary";
import { computeTraitScores } from "./lib/scoring";
import { saveAnswers, loadAnswers } from "./lib/persist";

export default function App() {
	const quiz = quizData;
	const [answers, setAnswers] = useState(() => loadAnswers(quiz.id));
	const [finished, setFinished] = useState(false);
	const [result, setResult] = useState<any | null>(null);

	function onAnswersUpdate(next: any[]) {
		setAnswers(next);
		saveAnswers(quiz.id, next);
	}

	function onFinish() {
		const summary = computeTraitScores(
			quiz as any,
			answers as any,
			(quiz as any).traits ?? [],
			{ includeOverall: true }
		);
		const scores = summary.traitScores;
		setResult({ scores, average: summary.average, overall: summary.overall });
		setFinished(true);
	}

	return (
		<div className="wrapper">
			<h1>{quiz.title}</h1>
			<p>{quiz.description}</p>
			{!finished ? (
				<QuizShell
					quiz={quiz as any}
					answers={answers}
					onAnswersUpdate={onAnswersUpdate}
					onFinish={onFinish}
				/>
			) : (
				<ResultSummary
					quiz={quiz as any}
					traits={(quiz as any).traits ?? []}
					result={result}
				/>
			)}
		</div>
	);
}
