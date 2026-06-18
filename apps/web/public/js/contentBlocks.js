import { createMediaElement } from "./media.js";
import { createRichContentFragment } from "./richText.js";

const COMPONENTS = {
  RICH_TEXT: "shared.rich-text",
  CONTENT_RICH_TEXT: "shared.content-rich-text",
  MEDIA: "shared.media",
  EXTERNAL_IMAGE: "shared.external-image",
  QUOTE: "shared.quote",
  SLIDER: "shared.slider",
  EXTERNAL_GALLERY: "shared.external-gallery",
};

export function renderContentBlocksInto(container, blocks, templates = {}) {
  if (!container) return false;

  const fragment = createContentBlocksFragment(blocks, templates);
  const hasBlocks = Boolean(fragment.childNodes.length);

  if (hasBlocks) {
    container.replaceChildren(fragment);
  }

  return hasBlocks;
}

export function createContentBlocksFragment(blocks, templates = {}) {
  const fragment = document.createDocumentFragment();

  if (!Array.isArray(blocks)) return fragment;

  blocks.forEach((block) => {
    const element = createContentBlock(block, templates);

    if (element) {
      fragment.appendChild(element);
    }
  });

  return fragment;
}

function createContentBlock(block, templates) {
  switch (block?.__component) {
    case COMPONENTS.RICH_TEXT:
    case COMPONENTS.CONTENT_RICH_TEXT:
      return createRichTextBlock(block);
    case COMPONENTS.MEDIA:
      return createMediaBlock(block, templates.media);
    case COMPONENTS.EXTERNAL_IMAGE:
      return createExternalImageBlock(block, templates.media);
    case COMPONENTS.QUOTE:
      return createQuoteBlock(block, templates.quote);
    case COMPONENTS.SLIDER:
      return createSliderBlock(block, templates.slider, templates.sliderItem);
    case COMPONENTS.EXTERNAL_GALLERY:
      return createExternalGalleryBlock(block, templates.slider, templates.sliderItem);
    default:
      return null;
  }
}

function createRichTextBlock(block) {
  const content = block.body;
  const fragment = Array.isArray(content)
    ? createRichContentFragment(content)
    : createPlainTextFragment(content);

  if (!fragment.childNodes.length) return null;

  const section = document.createElement("section");
  section.className = "content-block content-block-rich-text";
  section.appendChild(fragment);

  return section;
}

function createPlainTextFragment(content) {
  const fragment = document.createDocumentFragment();

  if (typeof content !== "string" || !content.trim()) return fragment;

  const paragraph = document.createElement("p");
  paragraph.className = "rich-paragraph";
  paragraph.textContent = content.trim();
  fragment.appendChild(paragraph);

  return fragment;
}

function createMediaBlock(block, template) {
  const mediaElement = createMediaElement(block.file);

  if (!mediaElement) return null;

  const figure = cloneTemplate(template, "figure");
  figure.classList.add("content-block", "content-block-media");
  figure.querySelector("[data-content-block-media-frame]")?.replaceChildren(mediaElement);

  return figure;
}

function createExternalImageBlock(block, template) {
  const image = createExternalImageElement(block);

  if (!image) return null;

  const figure = cloneTemplate(template, "figure");
  figure.classList.add("content-block", "content-block-media");
  figure.querySelector("[data-content-block-media-frame]")?.replaceChildren(image);

  return figure;
}

function createQuoteBlock(block, template) {
  const body = typeof block.body === "string" ? block.body.trim() : "";
  const title = typeof block.title === "string" ? block.title.trim() : "";

  if (!body && !title) return null;

  const quote = cloneTemplate(template, "figure");
  quote.classList.add("content-block", "content-block-quote");

  const titleNode = quote.querySelector("[data-content-block-quote-title]");
  const bodyNode = quote.querySelector("[data-content-block-quote-body]");

  if (titleNode) {
    titleNode.textContent = title;
    titleNode.hidden = !title;
  }

  if (bodyNode) {
    bodyNode.textContent = body;
  }

  return quote;
}

function createSliderBlock(block, sliderTemplate, sliderItemTemplate) {
  const items = normalizeMediaItems(block.files)
    .map((file) => createSliderItem(file, sliderItemTemplate))
    .filter(Boolean);

  if (!items.length) return null;

  const slider = cloneTemplate(sliderTemplate, "section");
  slider.classList.add("content-block", "content-block-slider");
  slider.querySelector("[data-content-block-slider-list]")?.replaceChildren(...items);

  return slider;
}

function createExternalGalleryBlock(block, sliderTemplate, sliderItemTemplate) {
  const items = normalizeExternalImages(block.images)
    .map((image) => createExternalGalleryItem(image, sliderItemTemplate))
    .filter(Boolean);

  if (!items.length) return null;

  const gallery = cloneTemplate(sliderTemplate, "section");
  gallery.classList.add("content-block", "content-block-slider");
  gallery.querySelector("[data-content-block-slider-list]")?.replaceChildren(...items);

  return gallery;
}

function createSliderItem(file, template) {
  const mediaElement = createMediaElement(file);

  if (!mediaElement) return null;

  const item = cloneTemplate(template, "li");
  item.querySelector("[data-content-block-slider-frame]")?.replaceChildren(mediaElement);

  return item;
}

function createExternalGalleryItem(imageData, template) {
  const image = createExternalImageElement(imageData);

  if (!image) return null;

  const item = cloneTemplate(template, "li");
  item.querySelector("[data-content-block-slider-frame]")?.replaceChildren(image);

  return item;
}

function createExternalImageElement({ url, alt } = {}) {
  if (typeof url !== "string" || !url.trim()) return null;

  const image = document.createElement("img");
  image.src = url.trim();
  image.alt = typeof alt === "string" ? alt : "";
  image.loading = "lazy";

  return image;
}

function normalizeExternalImages(images) {
  return Array.isArray(images) ? images : [];
}

function normalizeMediaItems(mediaItems) {
  if (Array.isArray(mediaItems)) return mediaItems;

  if (Array.isArray(mediaItems?.data)) return mediaItems.data;

  return [];
}

function cloneTemplate(template, fallbackTag) {
  const fallback = document.createElement(fallbackTag);

  if (!(template instanceof HTMLTemplateElement)) return fallback;

  return template.content.firstElementChild?.cloneNode(true) || fallback;
}
