import { API_URL } from "./api.js";

const STRAPI_ORIGIN = new URL(API_URL).origin;
const COVER_SIZES = ["small", "medium", "large", "full"];

function getMediaAttributes(media) {
  if (!media) return null;

  return media.attributes || media;
}

export function getMediaUrl(media) {
  const attributes = getMediaAttributes(media);
  const url = attributes?.url;

  if (!url) return "";

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `${STRAPI_ORIGIN}${url}`;
}

export function renderMediaElement(media, options = {}) {
  const attributes = getMediaAttributes(media);
  const src = getMediaUrl(media);

  if (!src) return "";

  const alternativeText =
    options.alt || attributes.alternativeText || attributes.caption || "";
  const mime = attributes.mime || "";
  const escapedAlt = escapeHtml(alternativeText);
  const escapedSrc = escapeHtml(src);

  if (mime.startsWith("video/")) {
    return `<video src="${escapedSrc}" controls playsinline muted preload="metadata"></video>`;
  }

  if (mime.startsWith("audio/")) {
    return `<audio src="${escapedSrc}" controls></audio>`;
  }

  if (mime && !mime.startsWith("image/")) {
    return `<a class="media-link" href="${escapedSrc}">${escapedAlt || "Open media"}</a>`;
  }

  return `<img src="${escapedSrc}" alt="${escapedAlt}" loading="lazy" />`;
}

export function getCoverSize(entry) {
  return COVER_SIZES.includes(entry?.coverSize) ? entry.coverSize : "medium";
}

export function applyCoverMedia(container, media, entry, options = {}) {
  if (!container) return false;

  const mediaMarkup = renderMediaElement(media, options);

  if (!mediaMarkup) {
    container.remove();
    return false;
  }

  container.innerHTML = mediaMarkup;
  container.dataset.coverSize = getCoverSize(entry);
  return true;
}

export function renderCoverMediaFigure(media, entry, options = {}) {
  const mediaMarkup = renderMediaElement(media, options);

  if (!mediaMarkup) return "";

  const className = ["cover-media", options.className].filter(Boolean).join(" ");

  return `<figure class="${className}" data-cover-size="${getCoverSize(entry)}">${mediaMarkup}</figure>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
