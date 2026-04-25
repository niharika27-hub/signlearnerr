import "dotenv/config";
import session from "express-session";
import passport from "./config/passport.js";
import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import learningRoutes from "./routes/learningRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import mongoose from "mongoose";

const app = express();

const allowedOrigins = (
	process.env.CORS_ORIGINS ||
	"http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174"
)
	.split(",")
	.map((value) => value.trim())
	.filter(Boolean);

function isLoopbackOrigin(origin) {
	try {
		const parsed = new URL(origin);
		return parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
	} catch (_error) {
		return false;
	}
}

const isDevelopment = process.env.NODE_ENV !== "production";

app.use(
	cors({
		origin: (origin, callback) => {
			// Allow non-browser tools like curl/postman and same-origin server requests.
			if (!origin) {
				return callback(null, true);
			}

			if (allowedOrigins.includes(origin)) {
				return callback(null, true);
			}

			// In local development, allow localhost on any port so Vite can auto-pick free ports.
			if (isDevelopment && isLoopbackOrigin(origin)) {
				return callback(null, true);
			}

			return callback(null, false);
		},
		credentials: true,
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
		maxAge: 3600,
	})
);

app.use(express.json());
app.use(cookieParser());
app.use(session({
	secret: process.env.SESSION_SECRET || "your-secret-key",
	resave: false,
	saveUninitialized: false,
	cookie: {
		secure: false,
		httpOnly: true,
		maxAge: 24 * 60 * 60 * 1000,
		sameSite: "lax",
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

export default app;
