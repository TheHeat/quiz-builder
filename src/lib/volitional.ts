import { VolitionalSheet, Scenario } from "./types";

export type FlattenResult = {
	scenarios: Scenario[];
	scenarioToCategory: Record<string, string>;
	indexMap: { categoryIndex: number; scenarioIndex: number }[];
};

export function flattenCategories(sheet: VolitionalSheet): FlattenResult {
	const scenarios: Scenario[] = [];
	const scenarioToCategory: Record<string, string> = {};
	const indexMap: { categoryIndex: number; scenarioIndex: number }[] = [];

	sheet.categories.forEach((cat, cIdx) => {
		cat.scenarios.forEach((sc, sIdx) => {
			scenarios.push(sc);
			scenarioToCategory[sc.id] = cat.id;
			indexMap.push({ categoryIndex: cIdx, scenarioIndex: sIdx });
		});
	});

	return { scenarios, scenarioToCategory, indexMap };
}

export default flattenCategories;
