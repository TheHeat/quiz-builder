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
}

const SheetContext = createContext<SheetContextType | undefined>(undefined);

export function useSheetContext() {
	const ctx = useContext(SheetContext);
	if (!ctx)
		throw new Error("useSheetContext must be used within a SheetProvider");
	return ctx;
}

export function SheetProvider({ children }: { children: React.ReactNode }) {
	const [sheet, setSheet] = useState<VolitionalSheet | null>(null);
	const [loading, setLoading] = useState(true);
	const [pageState, setPageState] = useState<PageState>("scenarios");
	const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
	const [responses, setResponses] = useState<VolitionalSheetResponse[]>([]);

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
			}}
		>
			{children}
		</SheetContext.Provider>
	);
}
