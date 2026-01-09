import React from "react";
import { Quiz } from "../lib/types";
import { clearAnswers, clearResults } from "../lib/persist";

type Props = {
	quiz: Quiz;
	result: any;
};

export default function QuizResults({ quiz, result }: Props) {
	// scoring API now returns values in the original quiz scale (e.g. 1..5).
	const quizMin = quiz.scale?.min ?? 1;
	const quizMax = quiz.scale?.max ?? 5;

	const formatNumber = (v: number) =>
		Number.isInteger(v) ? String(v) : v.toFixed(2);

	const formatFraction = (v: unknown) => {
		if (typeof v !== "number" || Number.isNaN(v)) return "N/A";
		return `${formatNumber(v)}/${quizMax}`;
	};

	const showPercentage = !!quiz.displayAsPercentage;

	const formatPercentage = (v: unknown) => {
		if (typeof v !== "number" || Number.isNaN(v)) return "N/A";
		if (quizMax === quizMin) return "N/A";
		const raw = ((v - quizMin) / (quizMax - quizMin)) * 100;
		const clamped = Math.max(0, Math.min(100, raw));
		return `${Math.round(clamped)}%`;
	};

	const scoreFor = (id: string) => {
		const v = result && result.scores ? result.scores[id] : undefined;
		return typeof v === "number" && !Number.isNaN(v)
			? v
			: Number.NEGATIVE_INFINITY;
	};

	const sortedTraits = [...(quiz.traits ?? [])].sort(
		(a, b) => scoreFor(b.id) - scoreFor(a.id)
	);

	// Guard: if result or result.scores is missing, show a message
	if (!result || !result.scores) {
		return (
			<div>
				<h2>Results</h2>
				<p>
					No results available. Please complete the quiz to see your results.
				</p>
			</div>
		);
	}

	return (
		<div>
			<h2>Results</h2>

			<div>
				{sortedTraits.map((t) => (
					<div
						key={t.id}
						style={{ marginBottom: 12 }}
					>
						<h3>{t.name}</h3>
						<p>{t.description}</p>
						<p>
							Score:{" "}
							{showPercentage
								? formatPercentage(result.scores[t.id] ?? NaN)
								: formatFraction(result.scores[t.id] ?? NaN)}
						</p>
					</div>
				))}
			</div>
			<div>
				<button
					onClick={() => {
						clearAnswers(quiz.id);
						clearResults(quiz.id);
						window.location.reload();
					}}
				>
					Take again
				</button>
				<button
					onClick={() => {
						clearAnswers(quiz.id);
						clearResults(quiz.id);
						window.location.href = "/";
					}}
				>
					Back To Home
				</button>
			</div>
		</div>
	);
}
