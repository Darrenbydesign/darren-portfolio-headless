import type { APIRoute } from "astro";
import { getBlogPosts, getCaseStudies } from "../lib/strapi";

const SITE_URL = "https://darrensorrelsdesign.com";

export const GET: APIRoute = async () => {
  const [posts, studies] = await Promise.all([
    getBlogPosts(),
    getCaseStudies(),
  ]);
  const paths = [
    "/",
    "/about/",
    "/blog/",
    "/work/",
    ...posts.filter((post) => post.slug).map((post) => `/blog/${post.slug}/`),
    ...studies
      .filter((study) => study.slug)
      .map((study) => `/work/${study.slug}/`),
  ];
  const urls = paths
    .map((path) => `  <url><loc>${SITE_URL}${escapeXml(path)}</loc></url>`)
    .join("\n");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
};

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
