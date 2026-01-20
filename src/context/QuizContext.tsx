import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from "react";
import { computeTraitScores } from "../lib/scoring";
import {
	saveAnswers,
	loadAnswers,
	saveResults,
	loadResults,
	clearResults,
} from "../lib/persist";

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

import { Quiz, Answer, LadderAnswerValue } from "../lib/types";

export function QuizProvider({ children }: { children: ReactNode }) {
	const [quiz, setQuiz] = useState<Quiz | null>(null);
	const [loading, setLoading] = useState(true);
	const [answers, setAnswers] = useState<Answer[]>([]);
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

	function onAnswersUpdate(next: Answer[]) {
		setAnswers(next);
		if (quiz) {
			saveAnswers(quiz.id, next);
			// Recompute and set result on every answer update
			const summary = computeTraitScores(quiz, next, quiz.traits ?? [], {
				includeOverall: true,
			});
			const resultObj = {
				quizId: quiz.id,
				...summary,
			};
			setResult(resultObj);
			saveResults(quiz.id, resultObj);
		}
	}

	function onFinish() {
		if (!quiz) return;
		// Enforce all questions answered for ladder quizzes
		if (quiz.scoringType === "ladder") {
			for (const q of quiz.questions) {
				const ans = answers.find((a) => a.questionId === q.id);
				if (
					!ans ||
					typeof ans.value !== "object" ||
					ans.value == null ||
					typeof ans.value.current !== "number" ||
					typeof ans.value.future !== "number"
				) {
					alert("Please answer both 'Current' and 'Future' for all questions.");
					return;
				}
			}
		} else {
			for (const q of quiz.questions) {
				const ans = answers.find((a) => a.questionId === q.id);
				if (!ans || ans.value == null || ans.value === "") {
					alert("Please answer all questions.");
					return;
				}
			}
		}
		const summary = computeTraitScores(quiz, answers, quiz.traits ?? [], {
			includeOverall: true,
		});
		const resultObj = {
			quizId: quiz.id,
			...summary,
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
