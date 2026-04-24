export const API_URL = 'http://localhost:1337/api';

export async function fetchFromStrapi(path) {
	const response = await fetch(`${API_URL}${path}`);

	if (!response.ok) {
		throw new Error(`Strapi request failed: ${response.status}`);
	}

	return response.json();
}