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

// Add token to requests automatically
apiClient.interceptors.request.use((config) => {
	const token = localStorage.getItem("authToken");
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

// Handle token errors
apiClient.interceptors.response.use(
	(response) => response,
	(error) => {
		// Only redirect to login if we have a token but it's invalid
		// (meaning the token expired or was revoked)
		const token = localStorage.getItem("authToken");
		if (error.response?.status === 401 && token) {
			// Token expired or invalid - clear storage and redirect
			localStorage.removeItem("authToken");
			localStorage.removeItem("user");
			window.location.href = "/login";
		}
		return Promise.reject(error);
	}
);

export async function signupUser(payload) {
	const response = await apiClient.post("/auth/signup", payload);
	return response.data;
}

export async function loginUser(payload) {
	const response = await apiClient.post("/auth/login", payload);
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

export async function resetPasswordWithToken(payload) {
	const response = await apiClient.post("/auth/reset-password", payload);
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
	const response = await apiClient.post(`/learning/lessons/${lessonId}/complete`, {
		score,
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

