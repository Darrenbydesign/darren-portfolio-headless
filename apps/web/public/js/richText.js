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

export function renderRichContent(content) {
	if (!Array.isArray(content)) return '';

	return content
		.map((block) => {
			if (block.type === 'paragraph') {
				const text = extractTextFromRichContent([block]);
				return text ? `<p>${text}</p>` : '';
			}

			if (block.type === 'heading') {
				const level = block.level || 2;
				const text = extractTextFromRichContent([block]);
				return text ? `<h${level}>${text}</h${level}>` : '';
			}

			if (block.type === 'list') {
				const tag = block.format === 'ordered' ? 'ol' : 'ul';

				const items = block.children
					.map((item) => {
						const itemText = item.children
							.map((child) => child.text || '')
							.join('');

						return `<li>${itemText}</li>`;
					})
					.join('');

				return `<${tag}>${items}</${tag}>`;
			}

			return '';
		})
		.join('');
}