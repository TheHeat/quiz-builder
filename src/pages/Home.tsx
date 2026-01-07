import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { clearAnswers } from "../lib/persist";

type QuizMeta = { slug: string; title: string; description?: string };

export default function Home() {
	const [quizzes, setQuizzes] = useState<QuizMeta[]>([]);

	useEffect(() => {
		const modules = import.meta.glob("/data/quizzes/*/quiz.json", {
			query: "?json",
		}) as Record<string, () => Promise<any>>;
		const entries = Object.entries(modules);
		Promise.all(
			entries.map(async ([path, loader]) => {
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
	}, []);

	return (
		<div className="wrapper">
			<h1>Available Quizzes</h1>
			<ul>
				{quizzes.map((q) => (
					<li key={q.slug}>
						<Link to={`/quiz/${q.slug}`}>{q.title}</Link>
						{q.description ? <div>{q.description}</div> : null}
					</li>
				))}
			</ul>

			<div style={{ marginTop: 12 }}>
				<button
					onClick={() => {
						quizzes.forEach((q) => clearAnswers(q.slug));
						alert("Cleared saved answers for all quizzes.");
					}}
				>
					Clear saved answers for all quizzes
				</button>
			</div>
		</div>
	);
}
