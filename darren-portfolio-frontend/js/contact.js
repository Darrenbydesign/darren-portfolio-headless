import { fetchFromStrapi } from './api.js';

export function setupContactForm() {
	const form = document.getElementById('contact-form');
	const statusEl = document.getElementById('form-status');

	if (!form || !statusEl) return;

	form.addEventListener('submit', async (e) => {
		e.preventDefault();

		const name = document.getElementById('name')?.value.trim() || '';
		const email = document.getElementById('email')?.value.trim() || '';
		const message = document.getElementById('message')?.value.trim() || '';

		try {
			await fetchFromStrapi('/contact-messages', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					data: {
						name,
						email,
						message,
					},
				}),
			});

			statusEl.textContent = "Message sent successfully! I'll get back to you soon.";
			statusEl.className = 'success';
			form.reset();
		} catch (error) {
			console.error('Error sending message:', error);
			statusEl.textContent = 'Error sending message. Please try again.';
			statusEl.className = 'error';
		}
	});
}