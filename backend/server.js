import cors from "cors";
import express from "express";
import bcrypt from "bcryptjs";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const USERS_FILE_PATH = path.join(__dirname, "users.json");

app.use(cors());
app.use(express.json());

app.get("/", (_request, response) => {
	response.json({
		ok: true,
		service: "signlearn-backend",
		message: "Backend is running. Use /api/health, /api/auth/signup, and /api/auth/login.",
	});
});

function sanitizeUser(user) {
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

async function readUsers() {
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

async function writeUsers(users) {
	await fs.writeFile(USERS_FILE_PATH, JSON.stringify(users, null, 2), "utf8");
}

app.get("/api/health", (_request, response) => {
	response.json({ ok: true, message: "SignLearn backend is running." });
});

app.post("/api/auth/signup", async (request, response) => {
	try {
		const { fullName, email, password, roleCategory, role, roleLabel } = request.body ?? {};

		if (!fullName || !email || !password || !roleCategory || !role) {
			return response.status(400).json({
				message: "fullName, email, password, roleCategory and role are required.",
			});
		}

		if (typeof password !== "string" || password.length < 6) {
			return response.status(400).json({
				message: "Password must be at least 6 characters long.",
			});
		}

		const normalizedEmail = String(email).trim().toLowerCase();
		const users = await readUsers();
		const existingUser = users.find((user) => user.email === normalizedEmail);

		if (existingUser) {
			return response.status(409).json({
				message: "An account with this email already exists.",
			});
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const newUser = {
			id: randomUUID(),
			fullName: String(fullName).trim(),
			email: normalizedEmail,
			passwordHash: hashedPassword,
			roleCategory,
			role,
			roleLabel: roleLabel || role,
			joinedAt: new Date().toISOString(),
		};

		users.push(newUser);
		await writeUsers(users);

		return response.status(201).json({
			message: "Account created successfully.",
			user: sanitizeUser(newUser),
		});
	} catch (error) {
		console.error("Signup error:", error);
		return response.status(500).json({ message: "Something went wrong while creating your account." });
	}
});

app.post("/api/auth/login", async (request, response) => {
	try {
		const { email, password } = request.body ?? {};

		if (!email || !password) {
			return response.status(400).json({
				message: "Email and password are required.",
			});
		}

		const normalizedEmail = String(email).trim().toLowerCase();
		const users = await readUsers();
		const user = users.find((item) => item.email === normalizedEmail);

		if (!user) {
			return response.status(401).json({ message: "Invalid email or password." });
		}

		const validPassword = await bcrypt.compare(password, user.passwordHash);

		if (!validPassword) {
			return response.status(401).json({ message: "Invalid email or password." });
		}

		return response.json({
			message: "Login successful.",
			user: sanitizeUser(user),
		});
	} catch (error) {
		console.error("Login error:", error);
		return response.status(500).json({ message: "Something went wrong while logging in." });
	}
});

app.listen(PORT, () => {
	console.log(`✅ SignLearn backend running on http://localhost:${PORT}`);
});
