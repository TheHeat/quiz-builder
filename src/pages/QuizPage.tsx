import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import QuizShell from "../components/QuizShell";
import ResultSummary from "../components/ResultSummary";
import { computeTraitScores } from "../lib/scoring";
import { saveAnswers, loadAnswers } from "../lib/persist";

export default function QuizPage() {
	const { slug } = useParams<{ slug: string }>();
	const [quiz, setQuiz] = useState<any | null>(null);
	const [loading, setLoading] = useState(true);
	const [answers, setAnswers] = useState<any[]>([]);
	const [finished, setFinished] = useState(false);
	const [result, setResult] = useState<any | null>(null);

	useEffect(() => {
		if (!slug) return;
		const modules = import.meta.glob("/data/quizzes/*/quiz.json", {
			query: "?json",
		}) as Record<string, () => Promise<any>>;
		const key = `/data/quizzes/${slug}/quiz.json`;
		const loader = modules[key];
		if (!loader) {
			setLoading(false);
			return;
		}
		loader()
			.then((data) => {
				setQuiz(data);
				setAnswers(() => loadAnswers(data.id) || []);
				setLoading(false);
			})
			.catch(() => setLoading(false));
	}, [slug]);

	function onAnswersUpdate(next: any[]) {
		setAnswers(next);
		if (quiz) saveAnswers(quiz.id, next);
	}

	function onFinish() {
		if (!quiz) return;
		const summary = computeTraitScores(
			quiz as any,
			answers as any,
			quiz.traits ?? [],
			{
				includeOverall: true,
			}
		);
		const scores = summary.traitScores;
		setResult({ scores, average: summary.average, overall: summary.overall });
		setFinished(true);
	}

	if (!slug)
		return (
			<div className="wrapper">
				{" "}
				<p>No quiz specified.</p>{" "}
			</div>
		);
	if (loading)
		return (
			<div className="wrapper">
				{" "}
				<p>Loading…</p>{" "}
			</div>
		);
	if (!quiz)
		return (
			<div className="wrapper">
				<p>
					Quiz not found. <Link to="/">Back</Link>
				</p>
			</div>
		);

	return (
		<div className="wrapper">
			<Link to="/">← Back</Link>
			<h1>{quiz.title}</h1>
			<p>{quiz.description}</p>
			{!finished ? (
				<QuizShell
					quiz={quiz as any}
					answers={answers}
					onAnswersUpdate={onAnswersUpdate}
					onFinish={onFinish}
				/>
			) : (
				<ResultSummary
					quiz={quiz as any}
					traits={quiz.traits ?? []}
					result={result}
				/>
			)}
		</div>
	);
}
