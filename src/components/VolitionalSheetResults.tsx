import React from "react";
import { Category, VolitionalSheetResponse } from "../lib/types";

interface VolitionalSheetResultsProps {
	categories: Category[];
	responses: VolitionalSheetResponse[];
}

export default function VolitionalSheetResults({
	categories,
	responses,
}: VolitionalSheetResultsProps) {
	const responseMap = new Map(responses.map((r) => [r.scenarioId, r]));

	return (
		<div>
			<h1>Your Responses</h1>

			<div>
				{categories.map((cat) => {
					// collect responses in this category
					const items = cat.scenarios
						.map((s) => ({ scenario: s, response: responseMap.get(s.id) }))
						.filter((sr) => sr.response)
						.map((sr) => ({ scenario: sr.scenario, response: sr.response! }));

					if (items.length === 0) return null;

					return (
						<div
							key={cat.id}
							style={{ marginBottom: 20 }}
						>
							<h2>{cat.title}</h2>
							{cat.description && <p>{cat.description}</p>}

							{items.map(({ scenario, response }) => {
								const optionLabels = response.selectedOptions
									.map((opt) => opt.label)
									.join(", ");
								return (
									<div
										key={response.scenarioId}
										style={{ marginBottom: 12 }}
									>
										<p>
											If {scenario.text}, I will {optionLabels}
										</p>
									</div>
								);
							})}
						</div>
					);
				})}
			</div>
		</div>
	);
}
