import { getUserByEmail } from "../services/userService.js";
import { isTeacherRole } from "./accessControl.js";

export async function teacherMiddleware(request, response, next) {
	try {
		const email = String(request.user?.email || "").trim().toLowerCase();
		const user = email ? await getUserByEmail(email) : null;

		if (!email || !user || !user.isActive) {
			return response.status(401).json({ message: "Not authenticated." });
		}

		if (!isTeacherRole(user)) {
			return response.status(403).json({ message: "Teacher access denied." });
		}

		request.teacherUser = user;
		next();
	} catch (error) {
		console.error("Teacher middleware error:", error);
		return response.status(500).json({ message: "Failed to verify teacher access." });
	}
}