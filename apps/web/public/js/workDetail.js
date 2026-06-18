import { fetchFromStrapi } from "./api.js";
import {
  extractListItemsFromRichContent,
  createRichContentFragment,
} from "./richText.js";
import { renderContentBlocksInto } from "./contentBlocks.js";
import { formatDate, getSlugFromUrl } from "./utils.js";
import { createMediaElement, getCoverSize } from "./media.js";
import { renderHeroMeta } from "./heroMeta.js";

async function loadCaseStudyDetail() {
  const container = document.getElementById("case-study-detail");
  const template = document.getElementById("case-study-detail-template");
  if (!container || !template) return;

  const slug = getSlugFromUrl();

  if (!slug) {
    showDetailMessage(container, "No case study selected.");
    return;
  }

  try {
    const encodedSlug = encodeURIComponent(slug);
    const result = await fetchFromStrapi(
      `/case-studies?filters[slug][$eq]=${encodedSlug}&populate[caseStudyCover]=*&populate[heroMeta]=*&populate[projectStats]=*&populate[deliverableProgress]=*&populate[media]=*&populate[contentBlocks][populate]=*`,
    );

    const study = result.data?.[0];

    if (!study) {
      showDetailMessage(container, "Case study not found.");
      return;
    }

    const fragment = template.content.cloneNode(true);
    const toolsList = extractListItemsFromRichContent(study.tools);

    fragment.querySelector("[data-study-title]").textContent =
      study.title || "Untitled Case Study";
    fragment.querySelector("[data-study-date]").textContent = formatDate(
      study.datePublished,
    );

    renderStack(fragment, toolsList);
    renderProgress(fragment, study.deliverableProgress);
    renderProjectStats(fragment, study.projectStats);
    renderHeroMeta(
      fragment.querySelector("[data-study-hero-meta]"),
      fragment.querySelector("[data-study-hero-meta-template]"),
      study.heroMeta,
    );
    renderHeroMedia(fragment, study);
    renderMediaGallery(fragment, study.media);

    renderCaseStudyContent(fragment, study);

    container.replaceChildren(fragment);
  } catch (error) {
    console.error("Error loading case study detail:", error);
    showDetailMessage(container, "Unable to load this case study right now.");
  }
}

function renderCaseStudyContent(fragment, study) {
  const content = fragment.querySelector("[data-study-content]");
  const renderedBlocks = renderContentBlocksInto(
    content,
    study.contentBlocks,
    getContentBlockTemplates(fragment),
  );

  if (renderedBlocks) return;

  renderRichField(fragment, "[data-study-description]", study.description);
  renderRichField(fragment, "[data-study-challenge]", study.challenge);
  renderRichField(fragment, "[data-study-solution]", study.solution);
  renderRichField(fragment, "[data-study-results]", study.results);
}

function getContentBlockTemplates(fragment) {
  return {
    media: fragment.querySelector("[data-content-block-media-template]"),
    quote: fragment.querySelector("[data-content-block-quote-template]"),
    slider: fragment.querySelector("[data-content-block-slider-template]"),
    sliderItem: fragment.querySelector("[data-content-block-slider-item-template]"),
  };
}

function renderRichField(fragment, selector, content) {
  fragment
    .querySelector(selector)
    .replaceChildren(createRichContentFragment(content));
}

function renderHeroMedia(fragment, study) {
  const coverShell = fragment.querySelector("[data-study-cover-shell]");
  const coverContainer = fragment.querySelector("[data-study-cover-media]");
  const mediaElement = createMediaElement(study.caseStudyCover, {
    alt: study.title || "Case study cover",
  });

  coverShell.setAttribute("media-density", getCoverSize(study));

  if (mediaElement) {
    coverContainer.replaceChildren(mediaElement);
    return;
  }

  fragment.querySelector("[data-study-monogram]").textContent = (
    study.title || "DS"
  )
    .slice(0, 2)
    .toUpperCase();
  coverShell.setAttribute("aria-hidden", "true");
}

function renderMediaGallery(fragment, mediaItems = []) {
  const mediaSection = fragment.querySelector("[data-study-media-section]");
  const mediaList = fragment.querySelector("[data-study-media-list]");
  const mediaTemplate = fragment.querySelector("[data-study-media-template]");

  renderMediaList(mediaList, mediaTemplate, mediaItems);
  mediaSection.hidden = mediaList.hidden;
}

function renderProjectStats(fragment, stats = []) {
  const statsContainer = fragment.querySelector("[data-study-stats]");
  const statsTemplate = fragment.querySelector("[data-study-stat-template]");
  const items = normalizeProjectStats(stats);

  statsContainer.replaceChildren(
    ...items.map((item) => createProjectStat(statsTemplate, item)),
  );
}

function createProjectStat(template, { label, value }) {
  const stat = template.content.firstElementChild.cloneNode(true);

  stat.querySelector("[data-study-stat-label]").textContent = label;
  stat.querySelector("[data-study-stat-value]").textContent = value;

  return stat;
}

function normalizeProjectStats(stats) {
  const items = Array.isArray(stats) ? stats : [];
  const normalizedItems = items
    .map((item) => ({
      label: typeof item?.label === "string" ? item.label.trim() : "",
      value: typeof item?.value === "string" ? item.value.trim() : "",
    }))
    .filter((item) => item.label && item.value);

  return normalizedItems.length
    ? normalizedItems
    : [
        { label: "Role", value: "UX Designer/Product Designer" },
        { label: "Duration", value: "1 month" },
        { label: "Industry", value: "Design" },
        { label: "Scope", value: "Internal Product" },
        { label: "Team", value: "Product, Engineering, Stakeholders" },
      ];
}

function renderMediaList(mediaList, mediaTemplate, mediaItems = []) {
  const renderedItems = normalizeMediaItems(mediaItems)
    .map((media) => createMediaItem(mediaTemplate, media))
    .filter(Boolean);

  if (!renderedItems.length) return;

  mediaList.replaceChildren(...renderedItems);
  mediaList.hidden = false;
}

function createMediaItem(template, media) {
  const mediaElement = createMediaElement(media);

  if (!mediaElement) return null;

  const item = template.content.firstElementChild.cloneNode(true);
  item.querySelector("[data-study-media-frame]").replaceChildren(mediaElement);
  return item;
}

function normalizeMediaItems(mediaItems) {
  if (Array.isArray(mediaItems)) return mediaItems;

  if (Array.isArray(mediaItems?.data)) return mediaItems.data;

  return [];
}

function renderStack(fragment, toolsList) {
  const stackContainer = fragment.querySelector("[data-study-stack]");
  const stackItems = toolsList.length ? toolsList : ["Strategy", "UX", "UI"];

  appendChips(stackContainer, stackItems);
}

function renderProgress(fragment, progressItems = []) {
  const progressContainer = fragment.querySelector("[data-study-progress]");
  const progressTemplate = fragment.querySelector(
    "[data-study-progress-template]",
  );
  const items = normalizeProgressItems(progressItems);

  progressContainer.replaceChildren(
    ...items.map((item) => createProgressItem(progressTemplate, item)),
  );
}

function createProgressItem(template, { label, percentage }) {
  const item = template.content.firstElementChild.cloneNode(true);
  const percentageText = `${percentage}%`;

  item.querySelector("[data-study-progress-label]").textContent = label;

  const value = item.querySelector("[data-study-progress-value]");
  value.value = percentageText;
  value.textContent = percentageText;

  const bar = item.querySelector("[data-study-progress-bar]");
  bar.value = percentage;
  bar.setAttribute("aria-label", `${label}: ${percentageText}`);

  return item;
}

function normalizeProgressItems(progressItems) {
  const items = Array.isArray(progressItems) ? progressItems : [];
  const normalizedItems = items
    .map((item) => ({
      label: typeof item?.label === "string" ? item.label.trim() : "",
      percentage: clampPercentage(item?.percentage),
    }))
    .filter((item) => item.label);

  return normalizedItems.length
    ? normalizedItems
    : [
        { label: "Product Strategy", percentage: 100 },
        { label: "UX Research", percentage: 100 },
        { label: "Visual Design", percentage: 100 },
      ];
}

function clampPercentage(value) {
  const percentage = Number(value);

  if (!Number.isFinite(percentage)) return 100;

  return Math.min(Math.max(Math.round(percentage), 0), 100);
}

function appendChips(container, items) {
  container.replaceChildren(
    ...items.map((item) => {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = item;
      return chip;
    }),
  );
}

function showDetailMessage(container, message) {
  const paragraph = document.createElement("p");
  paragraph.textContent = message;
  container.replaceChildren(paragraph);
}

document.addEventListener("DOMContentLoaded", loadCaseStudyDetail);
