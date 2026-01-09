import React from "react";
import { QuizProvider } from "./context/QuizContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SheetProvider } from "./context/SheetContext";
import Home from "./pages/Home";
import QuizPage from "./pages/QuizPage";
import VolitionalSheetPage from "./pages/VolitionalSheetPage";
import VolitionalSheetResponsesPage from "./pages/VolitionalSheetResponsesPage";
import QuizResultsPage from "./pages/QuizResultsPage";

export default function App() {
	return (
		<QuizProvider>
			<BrowserRouter basename="/quiz-builder/">
				<Routes>
					<Route
						path="/"
						element={<Home />}
					/>
					<Route
						path="/quiz/:slug"
						element={<QuizPage />}
					/>
					<Route
						path="/quiz/:slug/results"
						element={<QuizResultsPage />}
					/>
					<Route
						path="/sheets/:slug"
						element={
							<SheetProvider>
								<VolitionalSheetPage />
							</SheetProvider>
						}
					/>
					<Route
						path="/sheets/:slug/responses"
						element={
							<SheetProvider>
								<VolitionalSheetResponsesPage />
							</SheetProvider>
						}
					/>
				</Routes>
			</BrowserRouter>
		</QuizProvider>
	);
}
