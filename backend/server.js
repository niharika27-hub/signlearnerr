import app from "./app.js";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;
// console.log(process.env.MONGODB_URI);
async function startServer() {
	try {
		await connectDB();

		app.listen(PORT, () => {
			console.log(`✅ SignLearn backend running on http://localhost:${PORT}`);
		});
	} catch (error) {
		console.error("Failed to start server:", error);
		process.exit(1);
	}
}

startServer();
