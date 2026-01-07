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
	const formatDisplay = (v: number) =>
		typeof v === "number" ? v.toFixed(2) : "N/A";

	return (
		<div>
			<h2>Results</h2>
			{typeof result?.average === "number" && (
				<div style={{ marginBottom: 12 }}>
					{typeof result?.overall === "number" && (
						<span>
							<strong>Overall score:</strong> {formatDisplay(result.overall)}
						</span>
					)}
				</div>
			)}
			<div>
				{traits.map((t) => (
					<div
						key={t.id}
						style={{ marginBottom: 12 }}
					>
						<h3>{t.name}</h3>
						<p>{t.description}</p>
						<p>Score: {formatDisplay(result.scores?.[t.id] ?? NaN)}</p>
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
			</div>
		</div>
	);
}
