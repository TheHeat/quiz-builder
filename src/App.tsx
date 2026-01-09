import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import QuizPage from "./pages/QuizPage";
import VolitionalSheetPage from "./pages/VolitionalSheetPage";

export default function App() {
	return (
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
					path="/sheets/:slug"
					element={<VolitionalSheetPage />}
				/>
			</Routes>
		</BrowserRouter>
	);
}
