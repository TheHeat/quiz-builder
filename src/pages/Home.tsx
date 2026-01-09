import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { clearAnswers, clearVolitionalSheetResponses } from "../lib/persist";

type QuizMeta = { slug: string; title: string; description?: string };
type SheetMeta = { slug: string; title: string; description?: string };

export default function Home() {
	const [quizzes, setQuizzes] = useState<QuizMeta[]>([]);
	const [sheets, setSheets] = useState<SheetMeta[]>([]);

	useEffect(() => {
		// Load quizzes
		const quizModules = import.meta.glob("../../data/quizzes/*/quiz.json", {
			query: "?json",
		}) as Record<string, () => Promise<any>>;
		const quizEntries = Object.entries(quizModules);
		Promise.all(
			quizEntries.map(async ([path, loader]) => {
				const data = await loader();
				const parts = path.split("/");
				const slug = parts[3];
				return {
					slug,
					title: data.title ?? slug,
					description: data.description ?? "",
				};
			})
		).then((list) => setQuizzes(list));

		// Load volitional sheets
		const sheetModules = import.meta.glob(
			"../../data/volitional-sheets/*/sheet.json",
			{
				query: "?json",
			}
		) as Record<string, () => Promise<any>>;
		const sheetEntries = Object.entries(sheetModules);
		Promise.all(
			sheetEntries.map(async ([path, loader]) => {
				const data = await loader();
				const parts = path.split("/");
				const slug = parts[3];
				return {
					slug,
					title: data.title ?? slug,
					description: data.description ?? "",
				};
			})
		).then((list) => setSheets(list));
	}, []);

	return (
		<div className="wrapper">
			<h1>Quizzes</h1>
			<ul>
				{quizzes.map((q) => (
					<li key={q.slug}>
						<Link to={`/quiz/${q.slug}`}>{q.title}</Link>
						{q.description ? <div>{q.description}</div> : null}
					</li>
				))}
			</ul>

			<h1>Volitional Sheets</h1>
			<ul>
				{sheets.map((s) => (
					<li key={s.slug}>
						<Link to={`/sheets/${s.slug}`}>{s.title}</Link>
						{s.description ? <div>{s.description}</div> : null}
					</li>
				))}
			</ul>

			<div>
				<button
					onClick={() => {
						quizzes.forEach((q) => clearAnswers(q.slug));
						alert("Cleared saved quizzes.");
					}}
				>
					Clear all quizzes
				</button>
				<button
					onClick={() => {
						sheets.forEach((s) => clearVolitionalSheetResponses(s.slug));
						alert("Cleared saved volitional sheets.");
					}}
				>
					Clear all volitional sheets
				</button>
			</div>
		</div>
	);
}
