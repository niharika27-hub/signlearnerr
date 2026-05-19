import axios from "axios";
import { uploadFileToCloudinary } from "./cloudinaryUpload";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "https://signlearnerr.onrender.com";

// Create axios instance with token support
const apiClient = axios.create({
	baseURL: `${API_BASE_URL}/api`,
	headers: {
		"Content-Type": "application/json",
	},
	timeout: 15000, // 15 second timeout (allow longer for contact/email)
	withCredentials: true, // Send cookies with requests
});

// Handle auth errors using cookie-based sessions only.
apiClient.interceptors.response.use(
	(response) => response,
	(error) => {
		return Promise.reject(error);
	}
);

function isValidScore(value) {
	return Number.isFinite(value) && value >= 0 && value <= 100;
}

export function getApiErrorMessage(error, fallbackMessage = "Something went wrong. Please try again.") {
	if (!error) {
		return fallbackMessage;
	}

	const payloadMessage =
		error.response?.data?.message ||
		error.response?.data?.error ||
		error.response?.data?.details;

	if (typeof payloadMessage === "string" && payloadMessage.trim()) {
		return payloadMessage.trim();
	}

	if (typeof error.message === "string" && error.message.trim()) {
		return error.message.trim();
	}

	return fallbackMessage;
}

export async function signupUser(payload) {
	const response = await apiClient.post("/auth/signup", payload);
	return response.data;
}

export async function loginUser(payload) {
	const response = await apiClient.post("/auth/login", payload);
	return response.data;
}

export async function uploadAvatarFile(file) {
	const formData = new FormData();
	formData.append("avatar", file);

	const response = await fetch(`${API_BASE_URL}/api/auth/upload-avatar`, {
		method: "POST",
		body: formData,
		credentials: "include",
	});

	const payload = await response.json().catch(() => ({}));
	if (!response.ok) {
		throw new Error(payload?.message || payload?.error || "Avatar upload failed.");
	}

	return payload;
}

export async function getProfile() {
	const response = await apiClient.get("/auth/me");
	return response.data;
}

export async function updateProfile(payload) {
	const response = await apiClient.patch("/auth/update", payload);
	return response.data;
}

export async function changePassword(payload) {
	const response = await apiClient.patch("/auth/change-password", payload);
	return response.data;
}

export async function deleteAccount(payload) {
	const response = await apiClient.delete("/auth/delete", {
		data: payload,
	});
	return response.data;
}

export async function logoutUser() {
	const response = await apiClient.post("/auth/logout");
	return response.data;
}
export async function requestPasswordReset(payload) {
	const response = await apiClient.post("/auth/forgot-password", payload);
	return response.data;
}

export async function resetPasswordWithOtp(payload) {
	const response = await apiClient.post("/auth/reset-password", payload);
	return response.data;
}

export async function getAdminModules() {
	const response = await apiClient.get("/admin/modules");
	return response.data;
}

export async function getAdminUsers() {
	const response = await apiClient.get("/admin/users");
	return response.data;
}

export async function assignModuleToUser(moduleId, userId) {
	const response = await apiClient.post(`/admin/modules/${moduleId}/assignments`, { userId });
	return response.data;
}

export async function unassignModuleFromUser(moduleId, userId) {
	const response = await apiClient.delete(`/admin/modules/${moduleId}/assignments/${userId}`);
	return response.data;
}

export async function createAdminModule(payload) {
	const response = await apiClient.post("/admin/modules", payload);
	return response.data;
}

export async function updateAdminModule(moduleId, payload) {
	const response = await apiClient.patch(`/admin/modules/${moduleId}`, payload);
	return response.data;
}

export async function deleteAdminModule(moduleId) {
	const response = await apiClient.delete(`/admin/modules/${moduleId}`);
	return response.data;
}

export async function createAdminLesson(moduleId, payload) {
	const response = await apiClient.post(`/admin/modules/${moduleId}/lessons`, payload);
	return response.data;
}

export async function updateAdminLesson(lessonId, payload) {
	const response = await apiClient.patch(`/admin/lessons/${lessonId}`, payload);
	return response.data;
}

export async function deleteAdminLesson(lessonId) {
	const response = await apiClient.delete(`/admin/lessons/${lessonId}`);
	return response.data;
}

export async function getTeacherModules() {
	const response = await apiClient.get("/teacher/modules");
	return response.data;
}

export async function createTeacherLesson(moduleId, payload) {
	const response = await apiClient.post(`/teacher/modules/${moduleId}/lessons`, payload);
	return response.data;
}

export async function updateTeacherLesson(lessonId, payload) {
	const response = await apiClient.patch(`/teacher/lessons/${lessonId}`, payload);
	return response.data;
}

export async function deleteTeacherLesson(lessonId) {
	const response = await apiClient.delete(`/teacher/lessons/${lessonId}`);
	return response.data;
}

export async function getTeacherCloudinaryUploadSignature(payload = {}) {
	const response = await apiClient.post("/teacher/cloudinary/sign-upload", payload);
	return response.data;
}

export async function getAdminCloudinaryUploadSignature(payload = {}) {
	const response = await apiClient.post("/admin/cloudinary/sign-upload", payload);
	return response.data;
}

export async function uploadAdminModulePhoto(file) {
	const resourceType = "image";
	const publicId = `admin-module-${Date.now()}-${String(file?.name || "module-photo")
		.replace(/\.[^/.]+$/, "")
		.toLowerCase()
		.replace(/[^a-z0-9-_]+/g, "-")
		.replace(/^-+|-+$/g, "") || "module-photo"}`;

	const signatureResponse = await getAdminCloudinaryUploadSignature({
		folder: "signlearn/modules",
		publicId,
		resourceType,
	});

	if (!signatureResponse?.success || !signatureResponse?.data) {
		throw new Error(signatureResponse?.message || "Cloudinary signature request failed.");
	}

	const uploadResult = await uploadFileToCloudinary(file, signatureResponse.data);
	if (!uploadResult?.secureUrl) {
		throw new Error("Cloudinary upload did not return a secure URL.");
	}

	return {
		success: true,
		data: {
			url: uploadResult.secureUrl,
			publicId: uploadResult.publicId,
			resourceType: uploadResult.resourceType,
		},
	};
}

// ============================================================================
// Learning Module APIs
// ============================================================================

/**
 * Get all modules for the user's role category
 * @returns {Promise} { modules: Array }
 */
export async function getModules() {
	const response = await apiClient.get("/learning/modules");
	return response.data;
}

/**
 * Get a specific module with all lessons and completion status
 * @param {string} moduleId - Module ID
 * @returns {Promise} { module: Object }
 */
export async function getModule(moduleId) {
	const response = await apiClient.get(`/learning/modules/${moduleId}`);
	return response.data;
}

/**
 * Mark a lesson as completed
 * @param {string} lessonId - Lesson ID
 * @param {number} score - Optional score (0-100)
 * @returns {Promise} { success: boolean, data: Object }
 */
export async function completeLesson(lessonId, score = null) {
	if (score !== null && score !== undefined && !isValidScore(score)) {
		throw new Error("Score must be between 0 and 100.");
	}

	const response = await apiClient.post(`/learning/lessons/${lessonId}/complete`, {
		score: score === null || score === undefined ? null : Math.round(score),
	});
	return response.data;
}

/**
 * Get user's aggregated progress stats
 * @returns {Promise} { progress: Object }
 */
export async function getUserProgress() {
	const response = await apiClient.get("/learning/progress");
	const payload = response.data?.data ?? response.data?.progress ?? {};

	return {
		success: response.data?.success ?? true,
		progress: {
			streak: payload.streak ?? 0,
			xpThisWeek: payload.xpThisWeek ?? 0,
			totalXp: payload.totalXp ?? 0,
			modulesCompleted: payload.modulesCompleted ?? 0,
			totalModules: payload.totalModules ?? 0,
			lessonsCompleted: payload.lessonsCompleted ?? 0,
			totalLessons: payload.totalLessons ?? 0,
			moduleProgress: payload.moduleProgress ?? [],
			overallProgress:
				payload.overallProgress ?? payload.overallProgressPercentage ?? 0,
		},
	};
}

/**
 * Get user's progress for each module
 * @returns {Promise} { modules: Array }
 */
export async function getUserModuleProgress() {
	const response = await apiClient.get("/learning/user/progress/modules");
	const modules = response.data?.data?.modules ?? response.data?.modules ?? [];
	return {
		success: response.data?.success ?? true,
		modules,
	};
}

/**
 * Save a quiz attempt for current user
 * @param {Object} payload
 * @returns {Promise} { success: boolean, data: Object }
 */
export async function saveQuizAttempt(payload) {
	const response = await apiClient.post("/learning/quiz/attempts", payload);
	return response.data;
}

/**
 * Get recent quiz attempts for current user
 * @param {number} limit - max attempts to fetch (1-20)
 * @returns {Promise} { success: boolean, data: { attempts: Array } }
 */
export async function getQuizAttempts(limit = 5) {
	const safeLimit = Math.max(1, Math.min(Number(limit) || 5, 20));
	const response = await apiClient.get(`/learning/quiz/attempts?limit=${safeLimit}`);
	return response.data;
}

/**
 * Get all quiz questions for a lesson from database
 * @param {string} lessonId - MongoDB lesson ID
 * @returns {Promise} { success: boolean, data: Array<QuizQuestion>, count: number }
 */
export async function getQuizQuestionsForLesson(lessonId) {
	const response = await apiClient.get(`/quiz/lessons/${lessonId}/questions`);
	return response.data;
}

/**
 * Get all quiz questions for a module
 * @param {string} moduleId - MongoDB module ID
 * @returns {Promise} { success: boolean, data: Array<QuizQuestion>, count: number }
 */
export async function getQuizQuestionsForModule(moduleId) {
	const response = await apiClient.get(`/quiz/modules/${moduleId}/questions`);
	return response.data;
}

/**
 * Get a specific quiz question by ID
 * @param {string} questionId - MongoDB question ID
 * @returns {Promise} { success: boolean, data: QuizQuestion }
 */
export async function getQuizQuestion(questionId) {
	const response = await apiClient.get(`/quiz/questions/${questionId}`);
	return response.data;
}

/**
 * Get quiz questions by type (e.g., "alphabet-recognition")
 * @param {string} questionType - One of: alphabet-recognition, handshape-to-letter, text-based, image-to-text
 * @param {number} limit - max questions to fetch
 * @returns {Promise} { success: boolean, data: Array<QuizQuestion>, count: number }
 */
export async function getQuizQuestionsByType(questionType, limit = 10) {
	const response = await apiClient.get(`/quiz/questions/type/${questionType}?limit=${limit}`);
	return response.data;
}

/**
 * Browse Cloudinary images for quiz authoring
 * @param {Object} payload
 * @param {string} payload.folder - Cloudinary folder prefix
 * @param {number} payload.limit - Max images to return
 * @returns {Promise} { success: boolean, data: { folder, count, images } }
 */
export async function getQuizCloudinaryImages(payload = {}) {
	const params = new URLSearchParams();
	if (payload.folder) {
		params.set("folder", payload.folder);
	}
	if (payload.limit) {
		params.set("limit", String(payload.limit));
	}

	const queryString = params.toString();
	const response = await apiClient.get(`/quiz/cloudinary/images${queryString ? `?${queryString}` : ""}`);
	return response.data;
}

/**
 * Create a new quiz question (admin/teacher only)
 * @param {Object} payload - Question data
 * @returns {Promise} { success: boolean, data: QuizQuestion }
 */
export async function createQuizQuestion(payload) {
	const response = await apiClient.post(`/quiz/questions`, payload);
	return response.data;
}

/**
 * Update a quiz question (admin/teacher only)
 * @param {string} questionId - MongoDB question ID
 * @param {Object} payload - Updated question data
 * @returns {Promise} { success: boolean, data: QuizQuestion }
 */
export async function updateQuizQuestion(questionId, payload) {
	const response = await apiClient.put(`/quiz/questions/${questionId}`, payload);
	return response.data;
}

/**
 * Delete a quiz question (admin only)
 * @param {string} questionId - MongoDB question ID
 * @returns {Promise} { success: boolean }
 */
export async function deleteQuizQuestion(questionId) {
	const response = await apiClient.delete(`/quiz/questions/${questionId}`);
	return response.data;
}

// Contact / feedback
export async function sendFeedback(payload) {
	// payload: { name, email, message, page, type }
	const response = await apiClient.post(`/contact`, payload);
	return response.data;
}

