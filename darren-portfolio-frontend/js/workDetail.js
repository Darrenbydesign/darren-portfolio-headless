import { fetchFromStrapi } from './api.js';
import { extractListItemsFromRichContent, renderRichContent } from './richText.js';
import { formatDate, getSlugFromUrl } from './utils.js';

async function loadCaseStudyDetail() {
	const container = document.getElementById('case-study-detail');
	if (!container) return;

	const slug = getSlugFromUrl();

	if (!slug) {
		container.innerHTML = '<p>No case study selected.</p>';
		return;
	}

	try {
		const result = await fetchFromStrapi(
			`/case-studies?filters[slug][$eq]=${slug}&populate=*`
		);

		const study = result.data?.[0];

		if (!study) {
			container.innerHTML = '<p>Case study not found.</p>';
			return;
		}

		const toolsList = extractListItemsFromRichContent(study.tools);
		const toolsText = toolsList.length ? toolsList.join(', ') : '';

		container.innerHTML = `
			<a href="./work.html">← Back to Work</a>

			<header class="detail-header">
				<p class="date">${formatDate(study.datePublished)}</p>
				<h1>${study.title || 'Untitled Case Study'}</h1>
				${toolsText ? `<p><strong>Tools:</strong> ${toolsText}</p>` : ''}
			</header>

			<div class="detail-content">
				${renderRichContent(study.description)}
				${renderRichContent(study.challenge)}
				${renderRichContent(study.solution)}
				${renderRichContent(study.results)}
				${renderRichContent(study.tools)}
			</div>
		`;
	} catch (error) {
		console.error('Error loading case study detail:', error);
		container.innerHTML = '<p>Unable to load this case study right now.</p>';
	}
}

document.addEventListener('DOMContentLoaded', loadCaseStudyDetail);