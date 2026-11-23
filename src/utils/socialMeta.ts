import type { ProjectItem, SubstackPost } from "../data/kalyanData";

export interface SocialMetaPayload {
  title: string;
  description: string;
  type: "website" | "article";
  url: string;
  image: string;
  author?: string;
  publishedTime?: string;
}

export function buildDefaultMeta(origin: string): SocialMetaPayload {
  return {
    title: "Saragadam Kalyan | AI Engineer & Full-Stack Developer",
    description:
      "Personal website of Saragadam Kalyan — AI Engineer and Full-Stack Developer building practical LLM, RAG, agentic, and multimodal web systems.",
    type: "website",
    url: `${origin}/`,
    image: `${origin}/assets/aistudio/file_00000000101c8211a5934cb71d9606fd_e8b3c8a1.webp`,
  };
}

export function buildProjectMeta(project: ProjectItem, origin: string): SocialMetaPayload {
  return {
    title: `${project.title} — Saragadam Kalyan`,
    description: project.description,
    type: "website",
    url: `${origin}/projects/${encodeURIComponent(project.id)}`,
    image: `https://opengraph.githubassets.com/1/kalyan870/${encodeURIComponent(project.repoSlug)}`,
  };
}

export function buildArticleMeta(article: SubstackPost, origin: string): SocialMetaPayload {
  return {
    title: `${article.title} — Saragadam Kalyan`,
    description:
      article.summary ||
      "Read the full technical article by Saragadam Kalyan on AI Engineering and LLMs.",
    type: "article",
    url: `${origin}/blog/${encodeURIComponent(article.id)}`,
    image:
      article.coverImage ||
      `${origin}/assets/aistudio/file_00000000101c8211a5934cb71d9606fd_e8b3c8a1.webp`,
    author: article.author || "Saragadam Kalyan",
    publishedTime: article.pubDate,
  };
}

function upsertMetaTag(attrName: "name" | "property", attrValue: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attrName}="${attrValue}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attrName, attrValue);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

export function applySocialMeta(meta: SocialMetaPayload) {
  document.title = meta.title;
  upsertMetaTag("name", "description", meta.description);

  // Open Graph
  upsertMetaTag("property", "og:title", meta.title);
  upsertMetaTag("property", "og:description", meta.description);
  upsertMetaTag("property", "og:type", meta.type);
  upsertMetaTag("property", "og:url", meta.url);
  upsertMetaTag("property", "og:image", meta.image);

  // Twitter Cards
  upsertMetaTag("name", "twitter:card", "summary_large_image");
  upsertMetaTag("name", "twitter:title", meta.title);
  upsertMetaTag("name", "twitter:description", meta.description);
  upsertMetaTag("name", "twitter:image", meta.image);

  if (meta.author) {
    upsertMetaTag("name", "author", meta.author);
  }
  if (meta.publishedTime) {
    upsertMetaTag("property", "article:published_time", meta.publishedTime);
  }
}
