import { createHash } from "node:crypto";

const ALLOWED_RESOURCE_TYPES = new Set(["auto", "image", "video", "raw"]);

function normalizeResourceType(value) {
	const normalized = String(value || "auto").toLowerCase();
	return ALLOWED_RESOURCE_TYPES.has(normalized) ? normalized : "auto";
}

function createSignature(params, apiSecret) {
	const sortedEntries = Object.entries(params)
		.filter(([, value]) => value !== undefined && value !== null && value !== "")
		.sort(([left], [right]) => left.localeCompare(right));

	const signatureBase = sortedEntries
		.map(([key, value]) => `${key}=${value}`)
		.join("&");

	return createHash("sha1")
		.update(`${signatureBase}${apiSecret}`)
		.digest("hex");
}

export function getCloudinaryConfig() {
	return {
		cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
		apiKey: process.env.CLOUDINARY_API_KEY || "",
		apiSecret: process.env.CLOUDINARY_API_SECRET || "",
		defaultFolder: process.env.CLOUDINARY_UPLOAD_FOLDER || "signlearn",
	};
}

export function isCloudinaryConfigured() {
	const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
	return Boolean(cloudName && apiKey && apiSecret);
}

export function buildSignedUploadPayload(options = {}) {
	const config = getCloudinaryConfig();
	if (!isCloudinaryConfigured()) {
		return null;
	}

	const timestamp = Math.floor(Date.now() / 1000);
	const folder = String(options.folder || config.defaultFolder || "signlearn").trim();
	const publicId = options.publicId ? String(options.publicId).trim() : "";
	const resourceType = normalizeResourceType(options.resourceType);

	const signatureParams = {
		timestamp,
		folder,
	};

	if (publicId) {
		signatureParams.public_id = publicId;
	}

	const signature = createSignature(signatureParams, config.apiSecret);

	return {
		cloudName: config.cloudName,
		apiKey: config.apiKey,
		timestamp,
		folder,
		publicId,
		resourceType,
		signature,
	};
}
