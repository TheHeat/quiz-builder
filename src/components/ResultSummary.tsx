import React from "react";
import { Quiz, Trait } from "../lib/types";
import { clearAnswers } from "../lib/persist";

type Props = {
	quiz: Quiz;
	traits: Trait[];
	result: any;
};

export default function ResultSummary({ quiz, traits, result }: Props) {
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
		const v = result?.scores?.[id];
		return typeof v === "number" && !Number.isNaN(v)
			? v
			: Number.NEGATIVE_INFINITY;
	};

	const sortedTraits = [...traits].sort(
		(a, b) => scoreFor(b.id) - scoreFor(a.id)
	);

	return (
		<div>
			<h2>Results</h2>
			{typeof result?.average === "number" && (
				<div style={{ marginBottom: 12 }}>
					{typeof result?.overall === "number" && (
						<span>
							<strong>Overall score:</strong>{" "}
							{showPercentage
								? formatPercentage(result.overall)
								: formatFraction(result.overall)}
						</span>
					)}
				</div>
			)}
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
								? formatPercentage(result.scores?.[t.id] ?? NaN)
								: formatFraction(result.scores?.[t.id] ?? NaN)}
						</p>
					</div>
				))}
			</div>
			<div>
				<button
					onClick={() => {
						clearAnswers(quiz.id);
						window.location.reload();
					}}
				>
					Take again
				</button>
				<button
					onClick={() => {
						clearAnswers(quiz.id);
						window.location.href = "/";
					}}
				>
					Back To Home
				</button>
			</div>
		</div>
	);
}
