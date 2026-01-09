import React from "react";
import { Scenario, SelectedOption } from "../lib/types";

interface ScenarioRendererProps {
	scenario: Scenario;
	selectedOptions: SelectedOption[];
	onSelectionChange: (optionId: string, isSelected: boolean) => void;
}

export default function ScenarioRenderer({
	scenario,
	selectedOptions,
	onSelectionChange,
}: ScenarioRendererProps) {
	const selectedIds = new Set(selectedOptions.map((opt) => opt.id));

	return (
		<div>
			<h2>{scenario.text}</h2>
			<p>I will...</p>
			<ul>
				{scenario.options.map((option) => (
					<li>
						<label key={option.id}>
							<input
								type="checkbox"
								checked={selectedIds.has(option.id)}
								onChange={(e) => onSelectionChange(option.id, e.target.checked)}
							/>
							{option.label}
						</label>
					</li>
				))}
			</ul>
		</div>
	);
}
