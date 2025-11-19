import React, { useState } from "react";
import sampleQuiz from "../data/quizzes/sample-quiz.json";
import traits from "../data/traits.json";
import QuizShell from "./components/QuizShell";
import ResultSummary from "./components/ResultSummary";
import { computeTraitScores, classifyTraits } from "./lib/scoring";
import { saveAnswers, loadAnswers } from "./lib/persist";

export default function App() {
	const quiz = sampleQuiz;
	const [answers, setAnswers] = useState(() => loadAnswers(quiz.id));
	const [finished, setFinished] = useState(false);
	const [result, setResult] = useState<any | null>(null);

	function onAnswersUpdate(next: any[]) {
		setAnswers(next);
		saveAnswers(quiz.id, next);
	}

	function onFinish() {
		const scores = computeTraitScores(
			quiz as any,
			answers as any,
			traits as any
		);
		const classified = classifyTraits(scores, traits as any);
		setResult({ scores, classified });
		setFinished(true);
	}

	return (
		<div style={{ padding: 16 }}>
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
					traits={traits as any}
					result={result}
				/>
			)}
		</div>
	);
}
