import type { BlogPost, CaseStudy } from "./types";

interface StrapiCollectionResponse<T> {
  data?: Array<T | { id?: number; documentId?: string; attributes?: T }>;
}

const apiUrl = (
  import.meta.env.STRAPI_API_URL || import.meta.env.PUBLIC_STRAPI_API_URL
)
  ?.trim()
  .replace(/\/$/, "");
const apiToken = import.meta.env.STRAPI_API_TOKEN?.trim();
const blogPostsPath =
  "/blog-posts?sort[0]=datePublished:desc&pagination[pageSize]=100&populate[blogPostCover]=true&populate[author]=true&populate[category]=true&populate[media]=true&populate[contentBlocks][populate]=*";
const blogPostsFallbackPath =
  "/blog-posts?sort[0]=datePublished:desc&pagination[pageSize]=100&populate[blogPostCover]=true&populate[media]=true&populate[contentBlocks][populate]=*";

let blogPostsPromise: Promise<BlogPost[]> | undefined;
let caseStudiesPromise: Promise<CaseStudy[]> | undefined;

export function getStrapiOrigin() {
  if (!apiUrl) return "";
  return new URL(apiUrl).origin;
}

export function getBlogPosts() {
  blogPostsPromise ??= fetchBlogPosts();
  return blogPostsPromise;
}

export function getCaseStudies() {
  caseStudiesPromise ??= fetchCollection<CaseStudy>(
    "/case-studies?sort[0]=datePublished:desc&pagination[pageSize]=100&populate[caseStudyCover]=true&populate[heroMeta]=true&populate[projectStats]=true&populate[deliverableProgress]=true&populate[media]=true&populate[description][populate]=*&populate[challenge][populate]=*&populate[solution][populate]=*&populate[results][populate]=*",
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
    throw new StrapiFetchError(response.status, response.statusText, path, detail);
  }

  const payload = (await response.json()) as StrapiCollectionResponse<T>;
  return (payload.data ?? []).map(normalizeEntry);
}

async function fetchBlogPosts() {
  try {
    return await fetchCollection<BlogPost>(blogPostsPath);
  } catch (error) {
    if (!canRetryWithoutBlogRelations(error)) throw error;

    console.warn(
      "Blog author/category population failed. Building without those relations until Strapi schema and API token permissions are updated.",
    );
    return fetchCollection<BlogPost>(blogPostsFallbackPath);
  }
}

function canRetryWithoutBlogRelations(error: unknown) {
  if (!(error instanceof StrapiFetchError)) return false;
  if (![400, 403].includes(error.status)) return false;

  const detail = error.detail.toLowerCase();
  return (
    error.path.includes("populate[author]") ||
    error.path.includes("populate[category]") ||
    detail.includes("author") ||
    detail.includes("category")
  );
}

class StrapiFetchError extends Error {
  constructor(
    readonly status: number,
    statusText: string,
    readonly path: string,
    readonly detail: string,
  ) {
    super(
      `Strapi request failed (${status} ${statusText}) for ${path}.${detail ? ` ${detail}` : ""}`,
    );
  }
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
