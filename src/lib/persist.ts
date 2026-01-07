import { Answer } from "./types";

const prefix = "quiz-builder";

export function saveAnswers(quizId: string, answers: Answer[]) {
	try {
		localStorage.setItem(
			`${prefix}:answers:${quizId}`,
			JSON.stringify(answers)
		);
	} catch (e) {
		// ignore
	}
}

export function loadAnswers(quizId: string): Answer[] {
	try {
		const raw = localStorage.getItem(`${prefix}:answers:${quizId}`);
		if (!raw) return [];
		return JSON.parse(raw);
	} catch (e) {
		return [];
	}
}

export function clearAnswers(quizId: string) {
	try {
		localStorage.removeItem(`${prefix}:answers:${quizId}`);
	} catch (e) {
		// ignore
	}
}
