import { fetchFromStrapi } from "./api.js";
import {
  extractListItemsFromRichContent,
  extractTextFromRichContent,
} from "./richText.js";
import { formatDate, getPreviewText } from "./utils.js";
import { applyCoverMedia } from "./media.js";

async function loadCaseStudies() {
  const container = document.getElementById("case-studies");
  const template = document.getElementById("case-study-card-template");

  if (!container || !template) return;

  try {
    const result = await fetchFromStrapi("/case-studies?populate=*");
    const studies = result.data || [];

    container.replaceChildren();

    if (studies.length === 0) {
      showListMessage(container, "No case studies yet. Check back soon!");
      return;
    }

    studies.forEach((study) => {
      const clone = template.content.cloneNode(true);

      const coverMedia = study.caseStudyCover;
      const descriptionText = extractTextFromRichContent(study.description);
      const preview = getPreviewText(descriptionText, 160);

      const toolsList = extractListItemsFromRichContent(study.tools);
      const toolsText = toolsList.length > 0 ? toolsList.join(", ") : "N/A";

      const coverContainer = clone.querySelector("[data-study-cover-media]");
      applyCoverMedia(coverContainer, coverMedia, study, {
        alt: study.title || "Case study cover",
      });

      clone.querySelector("[data-study-title]").textContent =
        study.title || "Untitled Case Study";

      clone.querySelector("[data-study-date]").textContent = formatDate(
        study.datePublished,
      );

      clone.querySelector("[data-study-preview]").textContent = preview;
      const toolsContainer = clone.querySelector("[data-study-tools]");
      toolsContainer.textContent = "";
      toolsContainer.classList.add("chip-group");

      if (toolsList.length > 0) {
        toolsList.forEach((tool) => {
          const chip = document.createElement("span");
          chip.className = "chip";
          chip.textContent = tool;
          toolsContainer.appendChild(chip);
        });
      } else {
        toolsContainer.textContent = toolsText;
      }

      const link = clone.querySelector("[data-study-link]");
      link.href = `/work/detail?slug=${study.slug || ""}`;

      container.appendChild(clone);
    });
  } catch (error) {
    console.error("Error loading case studies:", error);
    showListMessage(container, "Unable to load case studies right now.");
  }
}

function showListMessage(container, message) {
  const paragraph = document.createElement("p");
  paragraph.textContent = message;
  container.replaceChildren(paragraph);
}

document.addEventListener("DOMContentLoaded", loadCaseStudies);
