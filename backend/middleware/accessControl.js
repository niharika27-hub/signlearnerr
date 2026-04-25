export function getAdminEmailsFromEnv() {
	return String(process.env.ADMIN_EMAILS || "")
		.split(",")
		.map((entry) => entry.trim().toLowerCase())
		.filter(Boolean);
}

export function getNormalizedRole(user) {
	return String(user?.role || "").trim().toLowerCase();
}

export function isAdminRole(user) {
	return getNormalizedRole(user) === "admin";
}

export function isTeacherRole(user) {
	return getNormalizedRole(user) === "teacher";
}

export function isEmergencyAdminEmail(email) {
	const normalizedEmail = String(email || "").trim().toLowerCase();
	return normalizedEmail ? getAdminEmailsFromEnv().includes(normalizedEmail) : false;
}
