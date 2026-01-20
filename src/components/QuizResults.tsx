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

	// For ladder quizzes, result.traitScores is Record<string, { current: number, future: number }>
	// For standard, it's Record<string, number>
	const isLadder = quiz.scoringType === "ladder";
	const ladderLabels = (isLadder && result.ladderLabels) || [
		"Current",
		"Future",
	];

	const scoreFor = (id: string) => {
		if (isLadder) {
			const v =
				result && result.traitScores ? result.traitScores[id] : undefined;
			return v && typeof v.current === "number" && typeof v.future === "number"
				? v
				: { current: NaN, future: NaN };
		} else {
			const v = result && result.scores ? result.scores[id] : undefined;
			return typeof v === "number" && !Number.isNaN(v)
				? v
				: Number.NEGATIVE_INFINITY;
		}
	};

	const sortedTraits = [...(quiz.traits ?? [])].sort((a, b) => {
		if (isLadder) {
			// Sort by sum of current+future descending
			const aScore = scoreFor(a.id);
			const bScore = scoreFor(b.id);
			return bScore.current + bScore.future - (aScore.current + aScore.future);
		} else {
			return scoreFor(b.id) - scoreFor(a.id);
		}
	});

	// Guard: if result or the relevant scores object is missing, show a message
	if (!result || (isLadder ? !result.traitScores : !result.scores)) {
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
						{isLadder ? (
							<div>
								<p>
									<strong>{ladderLabels[0]}:</strong>{" "}
									{showPercentage
										? formatPercentage(scoreFor(t.id).current)
										: formatFraction(scoreFor(t.id).current)}
								</p>
								<p>
									<strong>{ladderLabels[1]}:</strong>{" "}
									{showPercentage
										? formatPercentage(scoreFor(t.id).future)
										: formatFraction(scoreFor(t.id).future)}
								</p>
							</div>
						) : (
							<p>
								Score:{" "}
								{showPercentage
									? formatPercentage(result.scores[t.id] ?? NaN)
									: formatFraction(result.scores[t.id] ?? NaN)}
							</p>
						)}
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
