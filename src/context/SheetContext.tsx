import React, { createContext, useContext, useState, useCallback } from "react";
import { VolitionalSheet, VolitionalSheetResponse } from "../lib/types";

export type PageState = "scenarios" | "results";

interface SheetContextType {
	sheet: VolitionalSheet | null;
	setSheet: (sheet: VolitionalSheet | null) => void;
	loading: boolean;
	setLoading: (loading: boolean) => void;
	pageState: PageState;
	setPageState: (state: PageState) => void;
	currentScenarioIndex: number;
	setCurrentScenarioIndex: (idx: number) => void;
	responses: VolitionalSheetResponse[];
	setResponses: (responses: VolitionalSheetResponse[]) => void;
	loadSheetBySlug: (slug: string) => Promise<void>;
}

const SheetContext = createContext<SheetContextType | undefined>(undefined);

export function useSheetContext() {
	const ctx = useContext(SheetContext);
	if (!ctx)
		throw new Error("useSheetContext must be used within a SheetProvider");
	return ctx;
}

import { loadVolitionalSheetResponses } from "../lib/persist";

function SheetProvider({ children }: { children: React.ReactNode }) {
	const [sheet, setSheet] = useState<VolitionalSheet | null>(null);
	const [loading, setLoading] = useState(true);
	const [pageState, setPageState] = useState<PageState>("scenarios");
	const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
	const [responses, setResponses] = useState<VolitionalSheetResponse[]>([]);

	const loadSheetBySlug = useCallback(async (slug: string) => {
		setLoading(true);
		try {
			const modules = import.meta.glob("/data/volitional-sheets/*/sheet.json", {
				query: "?json",
			}) as Record<string, () => Promise<any>>;
			for (const [path, loader] of Object.entries(modules)) {
				const parts = path.split("/");
				const slugFromPath = parts[3];
				if (slugFromPath === slug) {
					const data = await loader();
					setSheet(data);
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
	}, []);

	return (
		<SheetContext.Provider
			value={{
				sheet,
				setSheet,
				loading,
				setLoading,
				pageState,
				setPageState,
				currentScenarioIndex,
				setCurrentScenarioIndex,
				responses,
				setResponses,
				loadSheetBySlug,
			}}
		>
			{children}
		</SheetContext.Provider>
	);
}

export { SheetProvider };
