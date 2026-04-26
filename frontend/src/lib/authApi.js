import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

// Create axios instance with token support
const apiClient = axios.create({
	baseURL: `${API_BASE_URL}/api`,
	headers: {
		"Content-Type": "application/json",
	},
	timeout: 5000, // 5 second timeout
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

	const response = await apiClient.post("/auth/upload-avatar", formData, {
		headers: {
			"Content-Type": "multipart/form-data",
		},
	});

	return response.data;
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

