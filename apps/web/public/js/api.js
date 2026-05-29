export const API_URL =
	window.DARREN_STRAPI_API_URL || 'http://localhost:1337/api';

export async function fetchFromStrapi(path, options = {}) {
	const response = await fetch(`${API_URL}${path}`, options);

	if (!response.ok) {
		throw new Error(`Strapi request failed: ${response.status}`);
	}

	return response.json();
}
