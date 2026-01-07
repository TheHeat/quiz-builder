import React from "react";
import { Scenario, VolitionalSheetResponse } from "../lib/types";

interface VolitionalSheetResultsProps {
	scenarios: Scenario[];
	responses: VolitionalSheetResponse[];
	onEdit: () => void;
}

export default function VolitionalSheetResults({
	scenarios,
	responses,
	onEdit,
}: VolitionalSheetResultsProps) {
	const scenarioMap = new Map(scenarios.map((s) => [s.id, s]));

	return (
		<div>
			<h1>Your Responses</h1>
			<div style={{ marginBottom: 24 }}>
				{responses.map((response) => {
					const scenario = scenarioMap.get(response.scenarioId);
					if (!scenario) return null;

					const optionLabels = response.selectedOptions
						.map((opt) => opt.label)
						.join(", ");

					return (
						<div
							key={response.scenarioId}
							style={{ marginBottom: 16 }}
						>
							<p>
								<strong>
									If {scenario.text}, I will {optionLabels}
								</strong>
							</p>
						</div>
					);
				})}
			</div>

			<button onClick={onEdit}>Edit Responses</button>
		</div>
	);
}
