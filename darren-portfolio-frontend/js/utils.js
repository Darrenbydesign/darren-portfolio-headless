export function getPreviewText(text, length = 160) {
	if (!text || typeof text !== 'string') return '';
	return text.length > length ? `${text.substring(0, length)}...` : text;
}

export function getSlugFromUrl() {
	const params = new URLSearchParams(window.location.search);
	return params.get('slug');
}

export function formatDate(dateValue) {
	if (!dateValue) return '';
	return new Date(dateValue).toLocaleDateString();
}