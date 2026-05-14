import "dotenv/config";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "./config/passport.js";
import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import authRoutes from "./routes/authRoutes.js";
import learningRoutes from "./routes/learningRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const allowedOrigins = new Set(
	[
		...(process.env.CORS_ORIGINS || "https://signlearnerr.vercel.app")
			.split(",")
			.map((value) => value.trim())
			.filter(Boolean),
		process.env.FRONTEND_URL,
	]
		.filter(Boolean)
		.map((value) => String(value).replace(/\/$/, ""))
);

function isSignlearnVercelOrigin(origin) {
	try {
		const parsed = new URL(origin);
		return parsed.hostname.endsWith(".vercel.app") && parsed.hostname.includes("signlearnerr");
	} catch (_error) {
		return false;
	}
}

function isLoopbackOrigin(origin) {
	try {
		const parsed = new URL(origin);
		return parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
	} catch (_error) {
		return false;
	}
}

app.use(
	cors({
		origin(origin, callback) {
			if (!origin) return callback(null, true);

			const normalizedOrigin = String(origin).replace(/\/$/, "");

			if (
				allowedOrigins.has(normalizedOrigin) ||
				isLoopbackOrigin(normalizedOrigin) ||
				isSignlearnVercelOrigin(normalizedOrigin)
			) {
				return callback(null, true);
			}

			console.warn("Blocked CORS origin:", normalizedOrigin);
			return callback(new Error("CORS origin not allowed"), false);
		},
		credentials: true,
	})
);


app.use(express.json());
app.use(cookieParser());
app.set("trust proxy", 1);
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

const sessionStore = new MongoStore({
	mongoUrl: process.env.MONGODB_URI || "mongodb://localhost:27017/signlearn",
	touchAfter: 24 * 3600,
	ttl: 24 * 60 * 60,
});

app.use(session({
	name: "signlearn.sid",
	secret: process.env.SESSION_SECRET || "your-secret-key",
	resave: false,
	saveUninitialized: false,
	store: sessionStore,
	cookie: {
		secure: process.env.NODE_ENV === "production",
		httpOnly: true,
		maxAge: 24 * 60 * 60 * 1000,
		sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
	},
}));

app.use(passport.initialize());
app.use(passport.session());

app.get("/", (_request, response) => {
	response.json({
		ok: true,
		service: "signlearn-backend",
		message: "Backend is running. Use /api/health, /api/auth/signup, and /api/auth/login.",
	});
});

app.get("/api/health", (_request, response) => {
	const mongoStateMap = {
		0: "disconnected",
		1: "connected",
		2: "connecting",
		3: "disconnecting",
	};

	response.json({
		ok: true,
		message: "SignLearn backend is running.",
		database: {
			state: mongoStateMap[mongoose.connection.readyState] || "unknown",
			name: mongoose.connection.name || null,
		},
	});
});
app.use("/api/auth", authRoutes);
app.use("/api/learning", learningRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/contact", contactRoutes);
export default app;
