import { fetchFromStrapi } from './api.js';
import { applyCoverMedia } from './media.js';
import { renderRichContentInto } from './richText.js';
import { renderContentBlocksInto } from './contentBlocks.js';
import { formatDate, getSlugFromUrl } from './utils.js';
import { renderHeroMeta } from './heroMeta.js';

async function loadBlogPostDetail() {
	const container = document.getElementById('blog-post-detail');
	const template = document.getElementById('blog-detail-template');
	if (!container || !template) return;

	const slug = getSlugFromUrl();

	if (!slug) {
		showDetailMessage(container, 'No blog post selected.');
		return;
	}

	try {
		const encodedSlug = encodeURIComponent(slug);
		const result = await fetchFromStrapi(
			`/blog-posts?filters[slug][$eq]=${encodedSlug}&populate[blogPostCover]=*&populate[heroMeta]=*&populate[media]=*&populate[contentBlocks][populate]=*`
		);

		const post = result.data?.[0];

		if (!post) {
			showDetailMessage(container, 'Blog post not found.');
			return;
		}

		const fragment = template.content.cloneNode(true);
		const excerpt = fragment.querySelector('[data-blog-excerpt]');
		const content = fragment.querySelector('[data-blog-content]');

		fragment.querySelector('[data-blog-date]').textContent = formatDate(
			post.datePublished
		);
		fragment.querySelector('[data-blog-title]').textContent =
			post.title || 'Untitled Post';

		if (post.excerpt) {
			excerpt.textContent = post.excerpt;
			excerpt.hidden = false;
		}

		renderHeroMeta(
			fragment.querySelector('[data-blog-hero-meta]'),
			fragment.querySelector('[data-blog-hero-meta-template]'),
			post.heroMeta
		);

		applyCoverMedia(fragment.querySelector('[data-blog-cover-media]'), post.blogPostCover, post, {
			alt: post.title || 'Blog post cover',
		});

		const renderedBlocks = renderContentBlocksInto(
			content,
			post.contentBlocks,
			getContentBlockTemplates(fragment)
		);

		if (!renderedBlocks) {
			renderRichContentInto(content, post.content);
		}
		container.replaceChildren(fragment);
	} catch (error) {
		console.error('Error loading blog post detail:', error);
		showDetailMessage(container, 'Unable to load this blog post right now.');
	}
}

function getContentBlockTemplates(fragment) {
	return {
		media: fragment.querySelector('[data-content-block-media-template]'),
		quote: fragment.querySelector('[data-content-block-quote-template]'),
		slider: fragment.querySelector('[data-content-block-slider-template]'),
		sliderItem: fragment.querySelector('[data-content-block-slider-item-template]'),
	};
}

function showDetailMessage(container, message) {
	const paragraph = document.createElement('p');
	paragraph.textContent = message;
	container.replaceChildren(paragraph);
}

document.addEventListener('DOMContentLoaded', loadBlogPostDetail);
