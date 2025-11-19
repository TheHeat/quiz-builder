// Placeholder Firebase adapter for later integration.
// Implement initFirebase and saveResult when ready to connect Firestore/Auth.

export async function initFirebase(): Promise<void> {
	// TODO: initialize Firebase app here
}

export async function saveResult(
	_quizId: string,
	_payload: unknown
): Promise<void> {
	// TODO: write to Firestore or Realtime DB
	console.warn("saveResult called but Firebase not configured");
}
