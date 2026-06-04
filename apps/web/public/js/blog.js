import { fetchFromStrapi } from './api.js';
import { applyCoverMedia } from './media.js';
import { extractTextFromRichContent } from './richText.js';
import { formatDate, getPreviewText } from './utils.js';

async function loadBlogPosts() {
	const container = document.getElementById('blog-posts');
	const template = document.getElementById('blog-card-template');

	if (!container || !template) return;

	try {
		const result = await fetchFromStrapi('/blog-posts?populate=*');
		const posts = result.data || [];

		container.replaceChildren();

		if (posts.length === 0) {
			showListMessage(container, 'No blog posts yet. Check back soon!');
			return;
		}

		posts.forEach((post) => {
			const clone = template.content.cloneNode(true);

			const fullText = extractTextFromRichContent(post.content);
			const preview = post.excerpt || getPreviewText(fullText, 160);
			const coverContainer = clone.querySelector('[data-blog-cover-media]');

			applyCoverMedia(coverContainer, post.blogPostCover, post, {
				alt: post.title || 'Blog post cover',
			});

			clone.querySelector('[data-blog-title]').textContent =
				post.title || 'Untitled Post';

			clone.querySelector('[data-blog-date]').textContent = formatDate(
				post.datePublished
			);

			clone.querySelector('[data-blog-preview]').textContent = preview;

			const link = clone.querySelector('[data-blog-link]');
			link.href = `/blog/detail?slug=${post.slug || ''}`;

			container.appendChild(clone);
		});
	} catch (error) {
		console.error('Error loading blog posts:', error);
		showListMessage(container, 'Unable to load blog posts right now.');
	}
}

function showListMessage(container, message) {
	const paragraph = document.createElement('p');
	paragraph.textContent = message;
	container.replaceChildren(paragraph);
}

document.addEventListener('DOMContentLoaded', loadBlogPosts);
