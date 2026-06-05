import { createMediaElement } from "./media.js";

export function extractTextFromRichContent(content) {
	if (!Array.isArray(content)) return '';

	return content
		.map((block) => {
			if (!Array.isArray(block.children)) return '';

			return block.children
				.map((child) => {
					if (Array.isArray(child.children)) {
						return child.children.map((nested) => nested.text || '').join('');
					}

					return child.text || '';
				})
				.join('');
		})
		.join(' ')
		.replace(/\s+/g, ' ')
		.trim();
}

export function extractListItemsFromRichContent(content) {
	if (!Array.isArray(content)) return [];

	return content
		.flatMap((block) => {
			if (block.type !== 'list' || !Array.isArray(block.children)) return [];

			return block.children.map((item) => {
				if (!Array.isArray(item.children)) return '';

				return item.children
					.map((child) => child.text || '')
					.join('')
					.trim();
			});
		})
		.filter(Boolean);
}

export function renderRichContentInto(container, content) {
	if (!container) return;

	container.replaceChildren(createRichContentFragment(content));
}

export function createRichContentFragment(content) {
	const fragment = document.createDocumentFragment();

	if (!Array.isArray(content)) return fragment;

	content.forEach((block) => {
		const element = createRichContentBlock(block);

		if (element) {
			fragment.appendChild(element);
		}
	});

	return fragment;
}

function createRichContentBlock(block) {
	if (block.type === 'paragraph') {
		const text = extractTextFromRichContent([block]);
		if (!text) return null;

		const paragraph = document.createElement('p');
		paragraph.className = 'rich-paragraph';
		paragraph.textContent = text;
		return paragraph;
	}

	if (block.type === 'heading') {
		const level = Math.min(Math.max(Number(block.level) || 2, 1), 6);
		const text = extractTextFromRichContent([block]);
		if (!text) return null;

		const heading = document.createElement(`h${level}`);
		heading.className = 'rich-heading';
		heading.textContent = text;
		return heading;
	}

	if (block.type === 'list') {
		const list = document.createElement(block.format === 'ordered' ? 'ol' : 'ul');
		list.className = 'rich-list';

		block.children?.forEach((item) => {
			const itemText = Array.isArray(item.children)
				? item.children.map((child) => child.text || '').join('')
				: '';

			if (!itemText) return;

			const listItem = document.createElement('li');
			listItem.className = 'rich-list-item';
			listItem.textContent = itemText;
			list.appendChild(listItem);
		});

		return list.children.length ? list : null;
	}

	if (block.type === 'image') {
		const mediaElement = createMediaElement(block.image);

		if (!mediaElement) return null;

		const figure = document.createElement('figure');
		figure.className = 'media rich-media';
		figure.setAttribute('media-variant', 'cover');
		figure.setAttribute('media-density', 'large');
		figure.appendChild(mediaElement);

		return figure;
	}

	return null;
}
