import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";

const app = express();
const PORT = Number(process.env.PORT) || 5000;

/**
 * Middleware Setup
 */

// Configure CORS
app.use(cors({
	origin: [
		"http://localhost:5173",
		"http://localhost:5174",
		"http://localhost:3000",
		"http://127.0.0.1:5173",
		"http://127.0.0.1:5174",
		"http://127.0.0.1:3000",
	],
	credentials: true,
	methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization"],
	maxAge: 3600,
}));

app.use(express.json());
app.use(cookieParser());

/**
 * Routes
 */

// Health check endpoints
app.get("/", (_request, response) => {
	response.json({
		ok: true,
		service: "signlearn-backend",
		message: "Backend is running. Use /api/health, /api/auth/signup, and /api/auth/login.",
	});
});

app.get("/api/health", (_request, response) => {
	response.json({ ok: true, message: "SignLearn backend is running." });
});

// Auth routes
app.use("/api/auth", authRoutes);

/**
 * Start Server
 */

app.listen(PORT, () => {
	console.log(`✅ SignLearn backend running on http://localhost:${PORT}`);
});
