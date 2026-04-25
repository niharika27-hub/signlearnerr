import cloudinary, { isCloudinaryConfigured } from "../config/cloudinary.js";
import { Readable } from "node:stream";

export function uploadBufferToCloudinary(buffer, options = {}) {
	if (!isCloudinaryConfigured()) {
		throw new Error("Cloudinary is not configured.");
	}

	return new Promise((resolve, reject) => {
		const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
			if (error) {
				reject(error);
				return;
			}

			resolve(result);
		});

		Readable.from([buffer]).pipe(uploadStream);
	});
}