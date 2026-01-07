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
		<div style={{ marginBottom: 24 }}>
			<h2>{scenario.text}</h2>
			<div style={{ marginLeft: 16 }}>
				{scenario.options.map((option) => (
					<label
						key={option.id}
						style={{
							display: "block",
							marginBottom: 8,
							cursor: "pointer",
						}}
					>
						<input
							type="checkbox"
							checked={selectedIds.has(option.id)}
							onChange={(e) => onSelectionChange(option.id, e.target.checked)}
							style={{ marginRight: 8 }}
						/>
						{option.label}
					</label>
				))}
			</div>
		</div>
	);
}
