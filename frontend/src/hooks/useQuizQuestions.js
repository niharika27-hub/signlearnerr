import { useState, useEffect } from "react";
import { getQuizQuestionsForLesson, getApiErrorMessage } from "@/lib/authApi";
import { normalizeQuestionFromDB } from "@/lib/quizUtils";

/**
 * Custom hook to fetch and manage quiz questions from database
 * Falls back to empty array if API fails or no questions found
 *
 * @param {string} lessonId - MongoDB lesson ID (optional)
 * @param {Array} jsonQuestions - JSON-based questions from learning-content.json (fallback)
 * @returns {Object} - { questions, loading, error }
 */
export function useQuizQuestions(lessonId = "", jsonQuestions = []) {
	const [questions, setQuestions] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		let isDisposed = false;

		async function loadQuestionsFromDB() {
			// If no lessonId, use JSON fallback
			if (!lessonId || !lessonId.trim()) {
				if (!isDisposed) {
					setQuestions(jsonQuestions || []);
					setLoading(false);
					setError(null);
				}
				return;
			}

			try {
				setLoading(true);
				setError(null);

				const response = await getQuizQuestionsForLesson(lessonId);

				if (!isDisposed) {
					if (response.success && Array.isArray(response.data)) {
						// Normalize questions from database format
						const normalizedQuestions = response.data.map(normalizeQuestionFromDB);
						setQuestions(normalizedQuestions);
					} else {
						// Fallback to JSON questions if database has no questions
						setQuestions(jsonQuestions || []);
					}
					setLoading(false);
				}
			} catch (err) {
				if (!isDisposed) {
					const errorMessage = getApiErrorMessage(err);
					console.warn("Failed to load questions from database, using JSON fallback:", errorMessage);
					// Fall back to JSON questions on error
					setQuestions(jsonQuestions || []);
					setError(errorMessage);
					setLoading(false);
				}
			}
		}

		loadQuestionsFromDB();

		return () => {
			isDisposed = true;
		};
	}, [lessonId, jsonQuestions]);

	return { questions, loading, error };
}
