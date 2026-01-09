import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from "react";
import { computeTraitScores } from "../lib/scoring";
import { saveAnswers, loadAnswers, saveResults, loadResults, clearResults } from "../lib/persist";

interface QuizContextType {
	quiz: any | null;
	setQuiz: (quiz: any | null) => void;
	loading: boolean;
	setLoading: (loading: boolean) => void;
	answers: any[];
	setAnswers: (answers: any[]) => void;
	finished: boolean;
	setFinished: (finished: boolean) => void;
	result: any | null;
	setResult: (result: any | null) => void;
	onAnswersUpdate: (next: any[]) => void;
	onFinish: () => void;
	loadQuiz: (slug: string | undefined) => void;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export function useQuizContext() {
	const ctx = useContext(QuizContext);
	if (!ctx)
		throw new Error("useQuizContext must be used within a QuizProvider");
	return ctx;
}

export function QuizProvider({ children }: { children: ReactNode }) {
	const [quiz, setQuiz] = useState<any | null>(null);
	const [loading, setLoading] = useState(true);
	const [answers, setAnswers] = useState<any[]>([]);
	const [finished, setFinished] = useState(false);
	const [result, setResult] = useState<any | null>(null);

	function loadQuiz(slug: string | undefined) {
		if (!slug) return;
		setLoading(true);
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
				// Load results from storage if available
				const storedResult = loadResults(data.id);
				setResult(storedResult);
				setLoading(false);
			})
			.catch(() => setLoading(false));
	}

	function onAnswersUpdate(next: any[]) {
		setAnswers(next);
		if (quiz) {
			saveAnswers(quiz.id, next);
			// Recompute and set result on every answer update
			const summary = computeTraitScores(
				quiz as any,
				next as any,
				quiz.traits ?? [],
				{ includeOverall: true }
			);
			const resultObj = {
				quizId: quiz.id,
				scores: summary.traitScores,
				average: summary.average,
				overall: summary.overall,
			};
			setResult(resultObj);
			saveResults(quiz.id, resultObj);
		}
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
		const resultObj = {
			quizId: quiz.id,
			scores: summary.traitScores,
			average: summary.average,
			overall: summary.overall,
		};
		setResult(resultObj);
		saveResults(quiz.id, resultObj);
		setFinished(true);
	}

	return (
		<QuizContext.Provider
			value={{
				quiz,
				setQuiz,
				loading,
				setLoading,
				answers,
				setAnswers,
				finished,
				setFinished,
				result,
				setResult,
				onAnswersUpdate,
				onFinish,
				loadQuiz,
			}}
		>
			{children}
		</QuizContext.Provider>
	);
}
