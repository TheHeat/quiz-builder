// Quiz Results persistence
export function saveResults(quizId: string, results: any) {
	try {
		localStorage.setItem(
			`${prefix}:results:${quizId}`,
			JSON.stringify(results)
		);
	} catch (e) {
		// ignore
	}
}

export function loadResults(quizId: string): any | null {
	try {
		const raw = localStorage.getItem(`${prefix}:results:${quizId}`);
		if (!raw) return null;
		return JSON.parse(raw);
	} catch (e) {
		return null;
	}
}

export function clearResults(quizId: string) {
	try {
		localStorage.removeItem(`${prefix}:results:${quizId}`);
	} catch (e) {
		// ignore
	}
}
import { Answer, VolitionalSheetResponse } from "./types";

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

export function saveVolitionalSheetResponses(
	sheetId: string,
	responses: VolitionalSheetResponse[]
) {
	try {
		localStorage.setItem(
			`${prefix}:volitional:${sheetId}`,
			JSON.stringify(responses)
		);
	} catch (e) {
		// ignore
	}
}

export function loadVolitionalSheetResponses(
	sheetId: string
): VolitionalSheetResponse[] {
	try {
		const raw = localStorage.getItem(`${prefix}:volitional:${sheetId}`);
		if (!raw) return [];
		return JSON.parse(raw);
	} catch (e) {
		return [];
	}
}

export function clearVolitionalSheetResponses(sheetId: string) {
	try {
		localStorage.removeItem(`${prefix}:volitional:${sheetId}`);
	} catch (e) {
		// ignore
	}
}
