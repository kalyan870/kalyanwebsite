import express from "express";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CURATED_PROJECTS, FALLBACK_SUBSTACK_POSTS } from "./src/data/kalyanData.ts";
import { createApiRouter, getCachedSubstackPosts } from "./src/server/apiRouter.ts";
import {
  attachGeminiLiveWebSocket,
  createGeminiRouter,
} from "./src/server/geminiRouter.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

async function createServer() {
  const app = express();
  app.use(express.json({ limit: "256kb" }));

  // Mount all /api/* routes (Substack RSS, GitHub metadata & heatmap, LinkedIn activity, Contact, Newsletter, Gemini AI)
  app.use("/api/gemini", createGeminiRouter());
  app.use("/api", createApiRouter());

  function escapeAttr(val: string): string {
    return val
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  async function resolveMetaForRequest(req: express.Request) {
    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
    const host = req.headers["x-forwarded-host"] || req.headers.host || `localhost:${PORT}`;
    const origin = `${protocol}://${host}`;
    const cleanPath = req.path;
    const projectParam = typeof req.query.project === "string" ? req.query.project : null;
    const postParam = typeof req.query.post === "string" ? req.query.post : null;

    const projectMatch = cleanPath.match(/^\/projects\/([^/]+)\/?$/);
    const blogMatch = cleanPath.match(/^\/blog\/([^/]+)\/?$/);

    const projectSlug = projectMatch ? decodeURIComponent(projectMatch[1]) : projectParam;
    const postSlug = blogMatch ? decodeURIComponent(blogMatch[1]) : postParam;

    if (projectSlug) {
      const project = CURATED_PROJECTS.find(
        (p) =>
          p.id.toLowerCase() === projectSlug.toLowerCase() ||
          p.repoSlug.toLowerCase() === projectSlug.toLowerCase()
      );
      if (project) {
        return {
          title: `${project.title} — Saragadam Kalyan`,
          description: project.description,
          type: "website",
          url: `${origin}/projects/${encodeURIComponent(project.id)}`,
          image: `https://opengraph.githubassets.com/1/kalyan870/${encodeURIComponent(project.repoSlug)}`,
        };
      }
    }

    if (postSlug) {
      const cachedPosts = getCachedSubstackPosts();
      const posts = cachedPosts?.length ? cachedPosts : FALLBACK_SUBSTACK_POSTS;
      const post = posts.find((p) => p.id.toLowerCase() === postSlug.toLowerCase());
      if (post) {
        return {
          title: `${post.title} — Saragadam Kalyan`,
          description:
            post.summary ||
            "Read the full technical article by Saragadam Kalyan on AI Engineering and LLMs.",
          type: "article",
          url: `${origin}/blog/${encodeURIComponent(post.id)}`,
          image:
            post.coverImage ||
            `${origin}/assets/aistudio/file_00000000101c8211a5934cb71d9606fd_e8b3c8a1.webp`,
        };
      }
    }

    return {
      title: "Saragadam Kalyan | AI Engineer & Full-Stack Developer",
      description:
        "Personal website of Saragadam Kalyan — AI Engineer and Full-Stack Developer building practical LLM, RAG, agentic, and multimodal web systems.",
      type: "website",
      url: `${origin}/`,
      image: `${origin}/assets/aistudio/file_00000000101c8211a5934cb71d9606fd_e8b3c8a1.webp`,
    };
  }

  function injectSocialMeta(html: string, meta: Awaited<ReturnType<typeof resolveMetaForRequest>>) {
    const socialTags = [
      `<title>${escapeAttr(meta.title)}</title>`,
      `<meta name="description" content="${escapeAttr(meta.description)}" />`,
      `<meta property="og:title" content="${escapeAttr(meta.title)}" />`,
      `<meta property="og:description" content="${escapeAttr(meta.description)}" />`,
      `<meta property="og:type" content="${escapeAttr(meta.type)}" />`,
      `<meta property="og:url" content="${escapeAttr(meta.url)}" />`,
      `<meta property="og:image" content="${escapeAttr(meta.image)}" />`,
      `<meta name="twitter:card" content="summary_large_image" />`,
      `<meta name="twitter:title" content="${escapeAttr(meta.title)}" />`,
      `<meta name="twitter:description" content="${escapeAttr(meta.description)}" />`,
      `<meta name="twitter:image" content="${escapeAttr(meta.image)}" />`,
    ].join("\n    ");

    return html
      .replace(/<title>[\s\S]*?<\/title>/i, "")
      .replace(
        /<meta\s+(?:name|property)=["'](?:description|og:title|og:description|og:type|og:url|og:image|twitter:card|twitter:title|twitter:description|twitter:image)["'][^>]*>/gi,
        ""
      )
      .replace("</head>", `    ${socialTags}\n  </head>`);
  }

  if (process.env.NODE_ENV === "production") {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath, { index: false }));
    app.get("*", async (req, res) => {
      if (/\.[a-z0-9]+$/i.test(req.path) && !req.path.endsWith(".html")) {
        return res.status(404).end();
      }
      try {
        const template = await fs.readFile(path.join(distPath, "index.html"), "utf-8");
        const meta = await resolveMetaForRequest(req);
        res.status(200).set({ "Content-Type": "text/html" }).send(injectSocialMeta(template, meta));
      } catch {
        res.sendFile(path.join(distPath, "index.html"));
      }
    });
  } else {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    app.use(vite.middlewares);

    app.get("*", async (req, res, next) => {
      if (/\.[a-z0-9]+$/i.test(req.path) && !req.path.endsWith(".html")) {
        return next();
      }
      try {
        const rawTemplate = await fs.readFile(path.resolve(__dirname, "index.html"), "utf-8");
        const transformed = await vite.transformIndexHtml(req.originalUrl, rawTemplate);
        const meta = await resolveMetaForRequest(req);
        res.status(200).set({ "Content-Type": "text/html" }).send(injectSocialMeta(transformed, meta));
      } catch (err) {
        vite.ssrFixStacktrace(err as Error);
        next(err);
      }
    });
  }

  const httpServer = http.createServer(app);
  attachGeminiLiveWebSocket(httpServer);

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

createServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
