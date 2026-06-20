import type { BlogPost, CaseStudy } from "./types";

interface StrapiCollectionResponse<T> {
  data?: Array<T | { id?: number; documentId?: string; attributes?: T }>;
}

const apiUrl = import.meta.env.STRAPI_API_URL?.trim().replace(/\/$/, "");
const apiToken = import.meta.env.STRAPI_API_TOKEN?.trim();

let blogPostsPromise: Promise<BlogPost[]> | undefined;
let caseStudiesPromise: Promise<CaseStudy[]> | undefined;

export function getStrapiOrigin() {
  if (!apiUrl) return "";
  return new URL(apiUrl).origin;
}

export function getBlogPosts() {
  blogPostsPromise ??= fetchCollection<BlogPost>(
    "/blog-posts?sort[0]=datePublished:desc&pagination[pageSize]=100&populate[blogPostCover]=true&populate[heroMeta]=true&populate[media]=true&populate[contentBlocks][populate]=*",
  );
  return blogPostsPromise;
}

export function getCaseStudies() {
  caseStudiesPromise ??= fetchCollection<CaseStudy>(
    "/case-studies?sort[0]=datePublished:desc&pagination[pageSize]=100&populate[caseStudyCover]=true&populate[heroMeta]=true&populate[projectStats]=true&populate[deliverableProgress]=true&populate[media]=true&populate[contentBlocks][populate]=*",
  );
  return caseStudiesPromise;
}

async function fetchCollection<T>(path: string) {
  if (!apiUrl) {
    throw new Error(
      "STRAPI_API_URL is required to build the portfolio. Set it to the Strapi /api URL.",
    );
  }

  const headers = new Headers({ Accept: "application/json" });
  if (apiToken) headers.set("Authorization", `Bearer ${apiToken}`);

  const response = await fetch(`${apiUrl}${path}`, { headers });

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 500);
    throw new Error(
      `Strapi request failed (${response.status} ${response.statusText}) for ${path}.${detail ? ` ${detail}` : ""}`,
    );
  }

  const payload = (await response.json()) as StrapiCollectionResponse<T>;
  return (payload.data ?? []).map(normalizeEntry);
}

function normalizeEntry<T>(entry: T | { id?: number; documentId?: string; attributes?: T }) {
  if (entry && typeof entry === "object" && "attributes" in entry && entry.attributes) {
    return {
      ...entry.attributes,
      id: entry.id,
      documentId: entry.documentId,
    } as T;
  }

  return entry as T;
}
