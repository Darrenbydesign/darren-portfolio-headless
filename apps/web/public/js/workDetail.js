import { fetchFromStrapi } from "./api.js";
import {
  extractListItemsFromRichContent,
  createRichContentFragment,
} from "./richText.js";
import { formatDate, getSlugFromUrl } from "./utils.js";
import { createMediaElement, getCoverSize } from "./media.js";

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
    const result = await fetchFromStrapi(
      `/case-studies?filters[slug][$eq]=${slug}&populate=*`,
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

    renderTools(fragment, toolsList);
    renderHeroMedia(fragment, study);

    renderCaseStudyContent(fragment, study);

    container.replaceChildren(fragment);
  } catch (error) {
    console.error("Error loading case study detail:", error);
    showDetailMessage(container, "Unable to load this case study right now.");
  }
}

function renderCaseStudyContent(fragment, study) {
  const content = fragment.querySelector("[data-study-content]");

  content.replaceChildren(
    createRichContentFragment(study.description),
    createRichContentFragment(study.challenge),
    createRichContentFragment(study.solution),
    createRichContentFragment(study.results),
  );
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

function renderTools(fragment, toolsList) {
  const toolsRow = fragment.querySelector("[data-study-tools-row]");
  const toolsContainer = fragment.querySelector("[data-study-tools]");
  const stackContainer = fragment.querySelector("[data-study-stack]");
  const stackItems = toolsList.length ? toolsList : ["Strategy", "UX", "UI"];

  if (toolsList.length) {
    appendChips(toolsContainer, toolsList);
    toolsRow.hidden = false;
  }

  appendChips(stackContainer, stackItems);
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
