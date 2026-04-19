import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USERS_FILE_PATH = path.join(__dirname, "../users.json");

/**
 * Sanitize user object - remove sensitive fields
 */
export function sanitizeUser(user) {
	if (!user) {
		return null;
	}

	return {
		id: user.id,
		fullName: user.fullName,
		email: user.email,
		roleCategory: user.roleCategory,
		role: user.role,
		roleLabel: user.roleLabel,
		joinedAt: user.joinedAt,
	};
}

/**
 * Read all users from JSON file
 */
export async function readUsers() {
	try {
		const raw = await fs.readFile(USERS_FILE_PATH, "utf8");
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch (error) {
		if (error.code === "ENOENT") {
			await fs.writeFile(USERS_FILE_PATH, "[]", "utf8");
			return [];
		}

		throw error;
	}
}

/**
 * Write users to JSON file
 */
export async function writeUsers(users) {
	await fs.writeFile(USERS_FILE_PATH, JSON.stringify(users, null, 2), "utf8");
}
