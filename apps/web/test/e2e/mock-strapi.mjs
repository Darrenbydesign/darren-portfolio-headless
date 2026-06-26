import { createServer } from "node:http";

const blogPosts = [
  {
    id: 1,
    documentId: "accessibility-test-post",
    title: "Accessibility Test Post",
    slug: "accessibility-test-post",
    datePublished: "2026-01-01",
    excerpt: "Fixture content for browser accessibility testing.",
    content: [],
    contentBlocks: [],
  },
];

const server = createServer((request, response) => {
  const url = new URL(request.url || "/", "http://127.0.0.1:1338");

  response.setHeader("Content-Type", "application/json");

  if (url.pathname === "/health") {
    response.end(JSON.stringify({ ok: true }));
    return;
  }

  if (url.pathname === "/api/blog-posts") {
    response.end(JSON.stringify({ data: blogPosts }));
    return;
  }

  if (url.pathname === "/api/case-studies") {
    response.end(JSON.stringify({ data: [] }));
    return;
  }

  response.statusCode = 404;
  response.end(JSON.stringify({ data: null }));
});

server.listen(1338, "127.0.0.1");

const close = () => server.close(() => process.exit(0));
process.on("SIGINT", close);
process.on("SIGTERM", close);
