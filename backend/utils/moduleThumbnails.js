const CATEGORY_THUMBNAILS = {
	alphabet: "https://images.pexels.com/photos/9017429/pexels-photo-9017429.jpeg?auto=compress&cs=tinysrgb&w=2000",
	vocabulary: "https://images.pexels.com/photos/9017418/pexels-photo-9017418.jpeg?auto=compress&cs=tinysrgb&w=2000",
	sentences: "https://images.pexels.com/photos/9017051/pexels-photo-9017051.jpeg?auto=compress&cs=tinysrgb&w=2000",
	conversation: "https://images.pexels.com/photos/9017377/pexels-photo-9017377.jpeg?auto=compress&cs=tinysrgb&w=2000",
};

const ORDER_THUMBNAILS = [
	"https://images.pexels.com/photos/9017429/pexels-photo-9017429.jpeg?auto=compress&cs=tinysrgb&w=2000",
	"https://images.pexels.com/photos/9017418/pexels-photo-9017418.jpeg?auto=compress&cs=tinysrgb&w=2000",
	"https://images.pexels.com/photos/9017051/pexels-photo-9017051.jpeg?auto=compress&cs=tinysrgb&w=2000",
	"https://images.pexels.com/photos/9017377/pexels-photo-9017377.jpeg?auto=compress&cs=tinysrgb&w=2000",
];

export function getModuleThumbnailUrl(moduleDoc = {}) {
	const explicitUrl = String(moduleDoc?.thumbnailUrl || "").trim();
	if (explicitUrl) {
		return explicitUrl;
	}

	const category = String(moduleDoc?.category || "").trim().toLowerCase();
	if (CATEGORY_THUMBNAILS[category]) {
		return CATEGORY_THUMBNAILS[category];
	}

	const orderIndex = Number(moduleDoc?.orderIndex || 0);
	if (Number.isFinite(orderIndex) && orderIndex > 0) {
		return ORDER_THUMBNAILS[(orderIndex - 1) % ORDER_THUMBNAILS.length];
	}

	return ORDER_THUMBNAILS[0];
}
