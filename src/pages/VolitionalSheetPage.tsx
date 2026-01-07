import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
	VolitionalSheet,
	Scenario,
	VolitionalSheetResponse,
	SelectedOption,
} from "../lib/types";
import {
	loadVolitionalSheetResponses,
	saveVolitionalSheetResponses,
} from "../lib/persist";
import ScenarioRenderer from "../components/ScenarioRenderer";
import VolitionalSheetResults from "../components/VolitionalSheetResults";

type PageState = "scenarios" | "results";

export default function VolitionalSheetPage() {
	const { slug } = useParams<{ slug: string }>();
	const navigate = useNavigate();

	const [sheet, setSheet] = useState<VolitionalSheet | null>(null);
	const [loading, setLoading] = useState(true);
	const [pageState, setPageState] = useState<PageState>("scenarios");
	const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
	const [responses, setResponses] = useState<VolitionalSheetResponse[]>([]);

	// Load sheet data and existing responses
	useEffect(() => {
		const loadSheet = async () => {
			if (!slug) return;
			try {
				const modules = import.meta.glob(
					"/data/volitional-sheets/*/sheet.json",
					{
						query: "?json",
					}
				) as Record<string, () => Promise<any>>;

				for (const [path, loader] of Object.entries(modules)) {
					const parts = path.split("/");
					const slugFromPath = parts[3];
					if (slugFromPath === slug) {
						const data = await loader();
						setSheet(data);

						// Load any existing responses
						const saved = loadVolitionalSheetResponses(slug);
						setResponses(saved.length > 0 ? saved : []);
						setLoading(false);
						return;
					}
				}
			} catch (e) {
				console.error("Failed to load sheet", e);
			}
			setLoading(false);
		};

		loadSheet();
	}, [slug]);

	if (loading) return <div className="wrapper">Loading...</div>;
	if (!sheet) return <div className="wrapper">Sheet not found</div>;

	const currentScenario = sheet.scenarios[currentScenarioIndex];
	const scenarioResponse = responses.find(
		(r) => r.scenarioId === currentScenario.id
	);
	const selectedOptions = scenarioResponse?.selectedOptions ?? [];

	const handleOptionToggle = (optionId: string, isSelected: boolean) => {
		const option = currentScenario.options.find((opt) => opt.id === optionId);
		if (!option) return;

		setResponses((prev) => {
			const newResponses = [...prev];
			const existingIndex = newResponses.findIndex(
				(r) => r.scenarioId === currentScenario.id
			);

			if (isSelected) {
				// Add option
				const newSelected = [
					...selectedOptions,
					{ id: option.id, label: option.label },
				];
				if (existingIndex >= 0) {
					newResponses[existingIndex].selectedOptions = newSelected;
				} else {
					newResponses.push({
						scenarioId: currentScenario.id,
						selectedOptions: newSelected,
					});
				}
			} else {
				// Remove option
				const newSelected = selectedOptions.filter(
					(opt) => opt.id !== optionId
				);
				if (existingIndex >= 0) {
					newResponses[existingIndex].selectedOptions = newSelected;
				}
			}

			return newResponses;
		});
	};

	const handleNextScenario = () => {
		if (currentScenarioIndex < sheet.scenarios.length - 1) {
			setCurrentScenarioIndex(currentScenarioIndex + 1);
		} else {
			// Save responses and show results
			saveVolitionalSheetResponses(slug!, responses);
			setPageState("results");
		}
	};

	const handlePreviousScenario = () => {
		if (currentScenarioIndex > 0) {
			setCurrentScenarioIndex(currentScenarioIndex - 1);
		}
	};

	const handleEditResponses = () => {
		setPageState("scenarios");
		setCurrentScenarioIndex(0);
	};

	const handleHome = () => {
		navigate("/");
	};

	if (pageState === "results") {
		return (
			<div className="wrapper">
				<h1>{sheet.title}</h1>
				<VolitionalSheetResults
					scenarios={sheet.scenarios}
					responses={responses}
					onEdit={handleEditResponses}
				/>
				<button
					onClick={handleHome}
					style={{ marginTop: 16 }}
				>
					Back to Home
				</button>
			</div>
		);
	}

	return (
		<div className="wrapper">
			<h1>{sheet.title}</h1>
			{sheet.description && <p>{sheet.description}</p>}

			<div style={{ marginBottom: 24 }}>
				<p>
					Scenario {currentScenarioIndex + 1} of {sheet.scenarios.length}
				</p>
			</div>

			<ScenarioRenderer
				scenario={currentScenario}
				selectedOptions={selectedOptions}
				onSelectionChange={handleOptionToggle}
			/>

			<div style={{ display: "flex", gap: 8 }}>
				<button
					onClick={handlePreviousScenario}
					disabled={currentScenarioIndex === 0}
				>
					Previous
				</button>
				<button onClick={handleNextScenario}>
					{currentScenarioIndex === sheet.scenarios.length - 1
						? "View Results"
						: "Next"}
				</button>
				<button onClick={handleHome}>Cancel</button>
			</div>
		</div>
	);
}
