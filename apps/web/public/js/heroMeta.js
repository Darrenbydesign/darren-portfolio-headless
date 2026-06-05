export function renderHeroMeta(container, template, items = []) {
  if (!container || !template) return;

  const chips = normalizeHeroMeta(items)
    .map((item) => createHeroMetaChip(template, item))
    .filter(Boolean);

  if (!chips.length) return;

  container.replaceChildren(...chips);
  container.hidden = false;
}

function createHeroMetaChip(template, { label }) {
  const chip = template.content.firstElementChild.cloneNode(true);
  chip.textContent = label;
  return chip;
}

function normalizeHeroMeta(items) {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => ({
      label: typeof item?.label === "string" ? item.label.trim() : "",
    }))
    .filter((item) => item.label);
}
