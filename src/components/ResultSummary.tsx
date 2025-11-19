import React from "react";
import { Quiz, Trait } from "../lib/types";

type Props = {
	quiz: Quiz;
	traits: Trait[];
	result: any;
};

export default function ResultSummary({ quiz, traits, result }: Props) {
	return (
		<div>
			<h2>Results</h2>
			<div>
				{traits.map((t) => (
					<div
						key={t.id}
						style={{ marginBottom: 12 }}
					>
						<h3>{t.name}</h3>
						<p>{t.description}</p>
						<p>
							Score: {(result.scores[t.id] ?? 0).toFixed(2)} —{" "}
							{result.classified[t.id]}
						</p>
					</div>
				))}
			</div>
			<div>
				<button onClick={() => window.location.reload()}>Take again</button>
			</div>
		</div>
	);
}
