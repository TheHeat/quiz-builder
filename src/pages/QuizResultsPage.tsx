import React from "react";
import { useParams, Link } from "react-router-dom";
import QuizResults from "../components/QuizResults";
import { useQuizContext } from "../context/QuizContext";

export default function QuizResultsPage() {
	const { slug } = useParams<{ slug: string }>();
	const { quiz, loading, result, loadQuiz } = useQuizContext();

	console.log("QuizResultsPage render", { slug, quiz, loading, result });

	React.useEffect(() => {
		loadQuiz(slug);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [slug]);

	if (!slug)
		return (
			<div className="wrapper">
				<p>No quiz specified.</p>
			</div>
		);
	if (loading)
		return (
			<div className="wrapper">
				<Link to="/">← Back</Link>
				<p>Loading…</p>
			</div>
		);
	if (!quiz)
		return (
			<div className="wrapper">
				<Link to="/">← Back</Link>
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
			<QuizResults
				quiz={quiz as any}
				result={result}
			/>
		</div>
	);
}
