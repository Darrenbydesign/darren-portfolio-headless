import { fetchFromStrapi } from './api.js';
import { renderRichContent } from './richText.js';
import { formatDate, getSlugFromUrl } from './utils.js';

function escapeHtml(value) {
	return String(value)
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

async function loadBlogPostDetail() {
	const container = document.getElementById('blog-post-detail');
	if (!container) return;

	const slug = getSlugFromUrl();

	if (!slug) {
		container.innerHTML = '<p>No blog post selected.</p>';
		return;
	}

	try {
		const result = await fetchFromStrapi(
			`/blog-posts?filters[slug][$eq]=${slug}&populate=*`
		);

		const post = result.data?.[0];

		if (!post) {
			container.innerHTML = '<p>Blog post not found.</p>';
			return;
		}

		container.innerHTML = `
			<a class="button" href="/blog">Back to Journal</a>

			<header class="detail-header">
				<p class="tag">Journal Entry</p>
				<p class="date">${formatDate(post.datePublished)}</p>
				<h1>${escapeHtml(post.title || 'Untitled Post')}</h1>
				${post.excerpt ? `<p class="detail-excerpt">${escapeHtml(post.excerpt)}</p>` : ''}
			</header>

			<div class="detail-content">
				${renderRichContent(post.content)}
			</div>
		`;
	} catch (error) {
		console.error('Error loading blog post detail:', error);
		container.innerHTML = '<p>Unable to load this blog post right now.</p>';
	}
}

document.addEventListener('DOMContentLoaded', loadBlogPostDetail);
