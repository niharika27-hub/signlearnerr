import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";

function readEnvValue(name) {
	const value = process.env[name];
	return typeof value === "string" ? value.trim() : "";
}

const hasExplicitCredentials = Boolean(
	readEnvValue("CLOUDINARY_CLOUD_NAME") &&
	readEnvValue("CLOUDINARY_API_KEY") &&
	readEnvValue("CLOUDINARY_API_SECRET")
);

if (hasExplicitCredentials) {
	cloudinary.config({
		cloud_name: readEnvValue("CLOUDINARY_CLOUD_NAME"),
		api_key: readEnvValue("CLOUDINARY_API_KEY"),
		api_secret: readEnvValue("CLOUDINARY_API_SECRET"),
		secure: true,
	});
}

export function isCloudinaryConfigured() {
	return hasExplicitCredentials;
}

export default cloudinary;