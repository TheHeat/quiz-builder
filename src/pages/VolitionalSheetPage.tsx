import React, { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { VolitionalSheetResponse } from "../lib/types";
import flattenCategories from "../lib/volitional";
import {
	loadVolitionalSheetResponses,
	saveVolitionalSheetResponses,
} from "../lib/persist";
import ScenarioRenderer from "../components/ScenarioRenderer";
import VolitionalSheetResults from "../components/VolitionalSheetResults";

import { useSheetContext } from "../context/SheetContext";

const VolitionalSheetPage = () => {
	const { slug } = useParams<{ slug: string }>();
	const navigate = useNavigate();
	const {
		sheet,
		loading,
		pageState,
		setPageState,
		currentScenarioIndex,
		setCurrentScenarioIndex,
		responses,
		setResponses,
		loadSheetBySlug,
	} = useSheetContext();

	useEffect(() => {
		if (slug) {
			loadSheetBySlug(slug);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [slug]);

	if (loading) return <div className="wrapper">Loading...</div>;
	if (!sheet) return <div className="wrapper">Sheet not found</div>;

	const { scenarios: flatScenarios } = flattenCategories(sheet);

	const currentScenario = flatScenarios[currentScenarioIndex];
	const scenarioResponse = responses.find(
		(r) => r.scenarioId === currentScenario.id
	);
	const selectedOptions = scenarioResponse?.selectedOptions ?? [];

	const handleOptionToggle = (optionId: string, isSelected: boolean) => {
		if (!sheet) return;
		const { scenarios: flatScenarios } = flattenCategories(sheet);
		const currentScenario = flatScenarios[currentScenarioIndex];
		const scenarioResponse = responses.find(
			(r) => r.scenarioId === currentScenario.id
		);
		const selectedOptions = scenarioResponse?.selectedOptions ?? [];
		const option = currentScenario.options.find((opt) => opt.id === optionId);
		if (!option) return;

		const newResponses = [...responses];
		const existingIndex = newResponses.findIndex(
			(r) => r.scenarioId === currentScenario.id
		);

		if (isSelected) {
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
			const newSelected = selectedOptions.filter((opt) => opt.id !== optionId);
			if (existingIndex >= 0) {
				newResponses[existingIndex].selectedOptions = newSelected;
			}
		}

		setResponses(newResponses);
	};

	const handleNextScenario = () => {
		const { scenarios: flatScenarios } = flattenCategories(sheet!);
		if (currentScenarioIndex < flatScenarios.length - 1) {
			setCurrentScenarioIndex(currentScenarioIndex + 1);
		} else {
			saveVolitionalSheetResponses(slug!, responses);
			setPageState("results");
		}
	};

	const handlePreviousScenario = () => {
		if (currentScenarioIndex > 0) {
			setCurrentScenarioIndex(currentScenarioIndex - 1);
		}
	};

	const handleHome = () => {
		navigate("/");
	};

	if (pageState === "results") {
		return (
			<div className="wrapper">
				<Link to="/">← Back</Link>
				<h1>{sheet?.title}</h1>
				<VolitionalSheetResults
					categories={sheet?.categories}
					responses={responses}
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

	if (loading) return <div className="wrapper">Loading...</div>;
	if (!sheet) return <div className="wrapper">Sheet not found</div>;

	return (
		<div className="wrapper">
			<Link to="/">← Back</Link>

			<h1>{sheet.title}</h1>
			{sheet.description && <p>{sheet.description}</p>}

			<div style={{ marginBottom: 24 }}>
				<p>
					Scenario {currentScenarioIndex + 1} of {flatScenarios.length}
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
					{currentScenarioIndex === flatScenarios.length - 1
						? "View Results"
						: "Next"}
				</button>
			</div>
		</div>
	);
};

export default VolitionalSheetPage;
