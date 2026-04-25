import { getUserByEmail } from "../services/userService.js";
import { getAdminEmailsFromEnv } from "./accessControl.js";

export async function adminMiddleware(request, response, next) {
	try {
		const email = String(request.user?.email || "").toLowerCase();

		if (!email) {
			return response.status(401).json({ message: "Not authenticated." });
		}

		const user = await getUserByEmail(email);
		if (!user || !user.isActive) {
			return response.status(403).json({ message: "Admin access denied." });
		}

		const roleValue = String(user.role || "").toLowerCase();
		const adminEmails = getAdminEmailsFromEnv();
		const isAdminRole = roleValue === "admin";
		const isAdminEmail = adminEmails.includes(email);

		if (!isAdminRole && !isAdminEmail) {
			return response.status(403).json({ message: "Admin access denied." });
		}

		request.adminUser = user;
		next();
	} catch (error) {
		console.error("Admin middleware error:", error);
		return response.status(500).json({ message: "Failed to verify admin access." });
	}
}