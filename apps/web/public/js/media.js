import { API_URL } from "./api.js";

const STRAPI_ORIGIN = new URL(API_URL).origin;
const COVER_SIZES = ["small", "medium", "large", "full", "zen"];

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

export function createMediaElement(media, options = {}) {
  const attributes = getMediaAttributes(media);
  const src = getMediaUrl(media);

  if (!src) return null;

  const alternativeText =
    options.alt || attributes.alternativeText || attributes.caption || "";
  const mime = attributes.mime || "";

  if (mime.startsWith("video/")) {
    const video = document.createElement("video");
    video.src = src;
    video.controls = true;
    video.playsInline = true;
    video.muted = true;
    video.preload = "metadata";
    return video;
  }

  if (mime.startsWith("audio/")) {
    const audio = document.createElement("audio");
    audio.src = src;
    audio.controls = true;
    return audio;
  }

  if (mime && !mime.startsWith("image/")) {
    const link = document.createElement("a");
    link.className = "media-link";
    link.href = src;
    link.textContent = alternativeText || "Open media";
    return link;
  }

  const image = document.createElement("img");
  image.src = src;
  image.alt = alternativeText;
  image.loading = "lazy";
  return image;
}

export function getCoverSize(entry) {
  if (!COVER_SIZES.includes(entry?.coverSize)) return "medium";

  return entry.coverSize === "full" ? "zen" : entry.coverSize;
}

export function applyCoverMedia(container, media, entry, options = {}) {
  if (!container) return false;

  const mediaElement = createMediaElement(media, options);

  if (!mediaElement) {
    container.remove();
    return false;
  }

  container.replaceChildren(mediaElement);
  container.setAttribute("media-density", getCoverSize(entry));
  container.hidden = false;
  return true;
}
