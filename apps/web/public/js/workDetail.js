import { fetchFromStrapi } from "./api.js";
import {
  extractListItemsFromRichContent,
  renderRichContent,
} from "./richText.js";
import { formatDate, getSlugFromUrl } from "./utils.js";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function loadCaseStudyDetail() {
  const container = document.getElementById("case-study-detail");
  if (!container) return;

  const slug = getSlugFromUrl();

  if (!slug) {
    container.innerHTML = "<p>No case study selected.</p>";
    return;
  }

  try {
    const result = await fetchFromStrapi(
      `/case-studies?filters[slug][$eq]=${slug}&populate=*`,
    );

    const study = result.data?.[0];

    if (!study) {
      container.innerHTML = "<p>Case study not found.</p>";
      return;
    }

    const toolsList = extractListItemsFromRichContent(study.tools);
    const safeTitle = escapeHtml(study.title || "Untitled Case Study");
    const toolsMarkup = toolsList.length
      ? `
				<div class="meta-line">
					<strong>Tools:</strong>
					<span class="chip-list">
						${toolsList
              .map((tool) => `<span class="chip">${escapeHtml(tool)}</span>`)
              .join("")}
					</span>
				</div>
			`
      : "";
    const stackMarkup = toolsList.length
      ? toolsList
          .map((tool) => `<span class="chip">${escapeHtml(tool)}</span>`)
          .join("")
      : '<span class="chip">Strategy</span><span class="chip">UX</span><span class="chip">UI</span>';

    container.innerHTML = `
			<a class="button back-link" href="/work">Back to Work</a>

			<header class="panel hero detail-hero" hero-layout="split">
				<div class="hero-copy">
					<p class="tag" tag-style="inverse">Case Study</p>
					<h1 class="hero-title">${safeTitle}</h1>
					<p class="hero-text text-lead">${formatDate(study.datePublished)}</p>
					${toolsMarkup}
				</div>
				<div class="panel hero-media" aria-hidden="true">
					<div class="hero-media-inner">
						<span class="monogram">${escapeHtml((study.title || "DS").slice(0, 2).toUpperCase())}</span>
					</div>
				</div>
			</header>

			<section class="stats-section detail-stats" aria-label="Case study snapshot">
				<article class="card" card-size="stat" card-style="halftone">
					<p class="tag">Role</p>
					<strong class="card-value">UX</strong>
				</article>
				<article class="card" card-size="stat" card-style="halftone">
					<p class="tag">Mode</p>
					<strong class="card-value">UI</strong>
				</article>
				<article class="card" card-size="stat" card-style="halftone">
					<p class="tag">System</p>
					<strong class="card-value">DS</strong>
				</article>
				<article class="card" card-size="stat" card-style="halftone" tag-style="inverse">
					<p class="tag">Launch</p>
					<strong class="card-value">01</strong>
				</article>
			</section>

			<div class="case-layout detail-layout">
				<div class="case-main">
					<section class="detail-content">
						${renderRichContent(study.description)}
						${renderRichContent(study.challenge)}
						${renderRichContent(study.solution)}
						${renderRichContent(study.results)}
					</section>
					<section class="panel" panel-type="showcase" aria-label="Case study visual system preview">
						<div class="showcase-screen">
							<span class="showcase-line"></span>
							<span class="showcase-line"></span>
							<span class="showcase-line"></span>
						</div>
					</section>
				</div>

				<aside class="case-sidebar">
					<section class="panel" panel-type="sidebar">
						<h2 class="panel-heading">Deliverables</h2>
						<div class="progress-list">
							<div class="progress-item"><span>Product Strategy</span><span>100%</span><i class="progress-bar"></i></div>
							<div class="progress-item"><span>UX Research</span><span>100%</span><i class="progress-bar"></i></div>
							<div class="progress-item"><span>Visual Design</span><span>100%</span><i class="progress-bar"></i></div>
						</div>
					</section>
					<section class="panel" panel-type="sidebar">
						<h2 class="panel-heading">Stack</h2>
						<div class="chip-list">${stackMarkup}</div>
					</section>
					<section class="panel" panel-type="cta">
						<h2 class="panel-heading">Work With Me</h2>
						<p class="panel-text">Let's build something as impactful as this.</p>
						<a class="button" href="/#contact">Hire Me Now</a>
					</section>
				</aside>
			</div>
		`;
  } catch (error) {
    console.error("Error loading case study detail:", error);
    container.innerHTML = "<p>Unable to load this case study right now.</p>";
  }
}

document.addEventListener("DOMContentLoaded", loadCaseStudyDetail);
