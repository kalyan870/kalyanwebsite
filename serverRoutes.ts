import type { Express, Request } from "express";
import fs from "node:fs/promises";
import { CURATED_PROJECTS, FALLBACK_SUBSTACK_POSTS } from "./src/data/kalyanData.ts";

const SUBSTACK_FEED_URL = "https://saragadamkalyan.substack.com/feed";
const GITHUB_REPOS_URL =
  "https://api.github.com/users/kalyan870/repos?sort=updated&per_page=100";
const GITHUB_EVENTS_URL =
  "https://api.github.com/users/kalyan870/events/public?per_page=10";
const RECIPIENT_EMAIL = "saragdamkalyan068@gmail.com";

export interface ParsedSubstackPost {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  formattedDate: string;
  author: string;
  summary: string;
  coverImage: string | null;
  contentHtml: string;
  readTimeMinutes: number;
  tags: string[];
}

interface CacheEntry<T> {
  data: T;
  fetchedAt: number;
}

interface ContributionDay {
  date: string;
  level: 0 | 1 | 2 | 3 | 4;
  count: number;
}

interface ContributionPayload {
  username: string;
  totalContributions: number;
  activeDays: number;
  longestStreak: number;
  currentStreak: number;
  bestDay: { date: string; count: number } | null;
  days: ContributionDay[];
  fetchedAt: string;
}

let substackCache: CacheEntry<ParsedSubstackPost[]> | null = null;
let githubCache: CacheEntry<
  Record<string, { stars: number; language: string | null; updatedAt: string }>
> | null = null;
let contributionsCache: CacheEntry<ContributionPayload> | null = null;

function stripCdata(raw: string): string {
  return raw
    .replace(/^<!\[CDATA\[/, "")
    .replace(/\]\]>$/, "")
    .trim();
}

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#8230;/g, "...")
    .replace(/&nbsp;/g, " ");
}

function extractTag(block: string, tagName: string): string {
  const escaped = tagName.replace(":", "\\:");
  const match = block.match(new RegExp(`<${escaped}[^>]*>([\\s\\S]*?)<\\/${escaped}>`, "i"));
  return match ? stripCdata(match[1]) : "";
}

function sanitizeSubstackHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(
      /<div[^>]*class="[^"]*subscription-widget-wrap-editor[^"]*"[\s\S]*?<\/form><\/div><\/div>/gi,
      ""
    )
    .replace(/<form[\s\S]*?<\/form>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .trim();
}

function extractHashtags(text: string): string[] {
  const matches = text.match(/#[A-Za-z0-9_]+/g) || [];
  return Array.from(new Set(matches.map((tag) => tag.replace(/^#/, "")))).slice(0, 5);
}

function formatPubDate(rawDate: string): string {
  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) return rawDate;
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function estimateReadTime(html: string): number {
  const plain = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = plain ? plain.split(" ").length : 0;
  return Math.max(1, Math.ceil(words / 200));
}

function parseRssFeed(xml: string): ParsedSubstackPost[] {
  const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/gi) || [];
  return itemMatches.map((itemXml, index) => {
    const title = decodeHtmlEntities(extractTag(itemXml, "title")) || "Untitled Post";
    const link = extractTag(itemXml, "link") || "https://saragadamkalyan.substack.com/";
    const pubDate = extractTag(itemXml, "pubDate");
    const author = decodeHtmlEntities(extractTag(itemXml, "dc:creator")) || "Saragadam Kalyan";
    const description = decodeHtmlEntities(extractTag(itemXml, "description"));
    const encodedRaw = extractTag(itemXml, "content:encoded") || `<p>${description}</p>`;
    const contentHtml = sanitizeSubstackHtml(encodedRaw);

    const enclosureMatch = itemXml.match(/<enclosure[^>]+url="([^"]+)"/i);
    const imgMatch = contentHtml.match(/<img[^>]+src="([^"]+)"/i);
    const coverImage = enclosureMatch?.[1] || imgMatch?.[1] || null;

    const tags = extractHashtags(contentHtml.replace(/<[^>]+>/g, " "));

    return {
      id: link.split("/p/")[1] || `post-${index + 1}`,
      title,
      link,
      pubDate,
      formattedDate: formatPubDate(pubDate),
      author,
      summary: description.replace(/<[^>]+>/g, "").trim(),
      coverImage,
      contentHtml,
      readTimeMinutes: estimateReadTime(contentHtml),
      tags,
    };
  });
}

export function registerApiRoutes(app: Express) {
  // Dynamic Substack RSS feed endpoint
  app.get("/api/substack", async (_req, res) => {
    try {
      const now = Date.now();
      if (substackCache && now - substackCache.fetchedAt < 5 * 60 * 1000) {
        return res.json({
          source: "substack-rss",
          publicationUrl: "https://saragadamkalyan.substack.com/",
          posts: substackCache.data,
        });
      }

      const response = await fetch(SUBSTACK_FEED_URL, {
        headers: {
          "User-Agent": "SaragadamKalyanPortfolio/1.0 (+https://saragadamkalyan.substack.com)",
          Accept: "application/rss+xml, application/xml, text/xml",
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        throw new Error(`Substack RSS returned ${response.status}`);
      }

      const xml = await response.text();
      const posts = parseRssFeed(xml);
      if (posts.length > 0) {
        substackCache = { data: posts, fetchedAt: now };
      }

      return res.json({
        source: "substack-rss",
        publicationUrl: "https://saragadamkalyan.substack.com/",
        posts,
      });
    } catch (error) {
      if (substackCache?.data?.length) {
        return res.json({
          source: "substack-cache",
          publicationUrl: "https://saragadamkalyan.substack.com/",
          posts: substackCache.data,
        });
      }
      return res.status(502).json({
        error: error instanceof Error ? error.message : "Unable to load Substack feed",
        posts: [],
      });
    }
  });

  // Live GitHub repository metadata enrichment endpoint
  app.get("/api/github-projects", async (_req, res) => {
    try {
      const now = Date.now();
      if (githubCache && now - githubCache.fetchedAt < 10 * 60 * 1000) {
        return res.json({ repos: githubCache.data });
      }

      const response = await fetch(GITHUB_REPOS_URL, {
        headers: {
          "User-Agent": "SaragadamKalyanPortfolio/1.0",
          Accept: "application/vnd.github+json",
        },
        signal: AbortSignal.timeout(6000),
      });

      if (!response.ok) {
        throw new Error(`GitHub API returned ${response.status}`);
      }

      const rawRepos = (await response.json()) as Array<{
        name: string;
        stargazers_count: number;
        language: string | null;
        updated_at: string;
        pushed_at?: string;
      }>;

      const repoMap: Record<string, { stars: number; language: string | null; updatedAt: string }> =
        {};
      for (const repo of rawRepos) {
        repoMap[repo.name.toLowerCase()] = {
          stars: repo.stargazers_count,
          language: repo.language,
          updatedAt: repo.pushed_at || repo.updated_at,
        };
      }

      githubCache = { data: repoMap, fetchedAt: now };
      return res.json({ repos: repoMap });
    } catch {
      return res.json({ repos: githubCache?.data ?? {} });
    }
  });

  // Live GitHub contributions heatmap endpoint for kalyan870
  app.get("/api/github-contributions", async (req, res) => {
    const forceRefresh = req.query.refresh === "1";
    const now = Date.now();
    if (!forceRefresh && contributionsCache && now - contributionsCache.fetchedAt < 15 * 60 * 1000) {
      return res.json(contributionsCache.data);
    }

    try {
      const response = await fetch("https://github.com/users/kalyan870/contributions", {
        headers: {
          "User-Agent": "SaragadamKalyanPortfolio/1.0",
          Accept: "text/html",
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        throw new Error(`GitHub contributions returned ${response.status}`);
      }

      const html = await response.text();

      const tooltipCounts = new Map<string, number>();
      const tipRegex = /<tool-tip[^>]*for="([^"]+)"[^>]*>([\s\S]*?)<\/tool-tip>/gi;
      let tipMatch: RegExpExecArray | null;
      while ((tipMatch = tipRegex.exec(html)) !== null) {
        const tipFor = tipMatch[1];
        const tipText = tipMatch[2].replace(/<[^>]+>/g, "").trim();
        const numMatch = tipText.match(/^(\d[\d,]*)\s+contribution/i);
        tooltipCounts.set(tipFor, numMatch ? Number(numMatch[1].replace(/,/g, "")) : 0);
      }

      const tdRegex = /<td([^>]*data-date="(\d{4}-\d{2}-\d{2})"[^>]*)>/gi;
      const parsedDays: ContributionDay[] = [];
      let tdMatch: RegExpExecArray | null;

      while ((tdMatch = tdRegex.exec(html)) !== null) {
        const attrs = tdMatch[1];
        const date = tdMatch[2];
        const idMatch = attrs.match(/\bid="([^"]+)"/i);
        const levelMatch = attrs.match(/data-level="(\d)"/i);
        const levelNum = Math.min(4, Math.max(0, Number(levelMatch?.[1] ?? 0))) as
          | 0
          | 1
          | 2
          | 3
          | 4;
        const tipCount = idMatch ? tooltipCounts.get(idMatch[1]) : undefined;
        const fallbackEstimate = levelNum === 0 ? 0 : levelNum * 3;
        const count = typeof tipCount === "number" ? tipCount : fallbackEstimate;
        parsedDays.push({ date, level: levelNum, count });
      }

      parsedDays.sort((a, b) => a.date.localeCompare(b.date));

      const headerMatch = html.match(/(\d[\d,]*)\s+contributions?\s+in\s+the\s+last\s+year/i);
      const sumCounts = parsedDays.reduce((acc, d) => acc + d.count, 0);
      const totalContributions = headerMatch
        ? Number(headerMatch[1].replace(/,/g, ""))
        : sumCounts;

      let activeDays = 0;
      let longestStreak = 0;
      let runningStreak = 0;
      let bestDay: { date: string; count: number } | null = null;

      for (const day of parsedDays) {
        if (day.count > 0 || day.level > 0) {
          activeDays += 1;
          runningStreak += 1;
          if (runningStreak > longestStreak) longestStreak = runningStreak;
          if (!bestDay || day.count > bestDay.count) {
            bestDay = { date: day.date, count: day.count };
          }
        } else {
          runningStreak = 0;
        }
      }

      let currentStreak = 0;
      for (let i = parsedDays.length - 1; i >= 0; i -= 1) {
        const d = parsedDays[i];
        if (d.count > 0 || d.level > 0) {
          currentStreak += 1;
        } else if (i < parsedDays.length - 1) {
          break;
        }
      }

      const payload: ContributionPayload = {
        username: "kalyan870",
        totalContributions,
        activeDays,
        longestStreak,
        currentStreak,
        bestDay,
        days: parsedDays,
        fetchedAt: new Date().toISOString(),
      };

      if (parsedDays.length > 0) {
        contributionsCache = { data: payload, fetchedAt: now };
      }

      return res.json(payload);
    } catch (error) {
      if (contributionsCache?.data) {
        return res.json(contributionsCache.data);
      }
      return res.status(502).json({
        error: error instanceof Error ? error.message : "Unable to load GitHub contributions",
        username: "kalyan870",
        totalContributions: 0,
        activeDays: 0,
        longestStreak: 0,
        currentStreak: 0,
        bestDay: null,
        days: [],
        fetchedAt: new Date().toISOString(),
      });
    }
  });

  // Dynamic LinkedIn & build-in-public activity endpoint
  app.get("/api/linkedin-activity", async (_req, res) => {
    try {
      const response = await fetch(GITHUB_EVENTS_URL, {
        headers: {
          "User-Agent": "SaragadamKalyanPortfolio/1.0",
          Accept: "application/vnd.github+json",
        },
        signal: AbortSignal.timeout(6000),
      });

      if (!response.ok) {
        throw new Error(`Activity fetch returned ${response.status}`);
      }

      const rawEvents = (await response.json()) as Array<{
        id: string;
        type: string;
        repo?: { name?: string };
        payload?: {
          ref?: string;
          ref_type?: string;
          size?: number;
          commits?: Array<{ message?: string; sha?: string }>;
        };
        created_at: string;
      }>;

      const liveActivity = rawEvents
        .map((ev) => {
          const repoFull = ev.repo?.name || "kalyan870";
          const shortRepo = repoFull.split("/").pop() || repoFull;
          const dateLabel = new Date(ev.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });

          if (ev.type === "PushEvent") {
            const firstMsg = ev.payload?.commits?.[0]?.message?.split("\n")[0];
            return {
              id: ev.id,
              kind: "Commit Push",
              title: firstMsg || `Updated ${shortRepo}`,
              repo: shortRepo,
              date: dateLabel,
              url: `https://github.com/${repoFull}`,
            };
          }
          if (ev.type === "CreateEvent") {
            return {
              id: ev.id,
              kind: "New Build",
              title: `Published ${ev.payload?.ref_type || "repository"} ${shortRepo}`,
              repo: shortRepo,
              date: dateLabel,
              url: `https://github.com/${repoFull}`,
            };
          }
          return null;
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
        .slice(0, 5);

      return res.json({
        linkedinUrl: "https://www.linkedin.com/in/saragadamkalyan/",
        liveActivity,
        syncedAt: new Date().toISOString(),
      });
    } catch {
      return res.json({
        linkedinUrl: "https://www.linkedin.com/in/saragadamkalyan/",
        liveActivity: [],
        syncedAt: new Date().toISOString(),
      });
    }
  });

  // Contact form submission endpoint -> targets saragdamkalyan068@gmail.com
  app.post("/api/contact", async (req, res) => {
    const { name, email, subject, message } = req.body ?? {};

    const cleanName = typeof name === "string" ? name.trim() : "";
    const cleanEmail = typeof email === "string" ? email.trim() : "";
    const cleanSubject = typeof subject === "string" ? subject.trim() : "";
    const cleanMessage = typeof message === "string" ? message.trim() : "";

    if (!cleanName || cleanName.length < 2) {
      return res.status(400).json({ error: "Please enter your name (at least 2 characters)." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    if (!cleanSubject || cleanSubject.length < 3) {
      return res.status(400).json({ error: "Please enter a brief subject." });
    }

    if (!cleanMessage || cleanMessage.length < 10) {
      return res.status(400).json({ error: "Please enter a message (at least 10 characters)." });
    }

    const submission = {
      id: `msg_${Date.now()}`,
      to: RECIPIENT_EMAIL,
      fromName: cleanName,
      fromEmail: cleanEmail,
      subject: cleanSubject,
      message: cleanMessage,
      receivedAt: new Date().toISOString(),
    };

    try {
      const logPath = "/tmp/kalyan_contact_submissions.json";
      let existing: unknown[] = [];
      try {
        const raw = await fs.readFile(logPath, "utf-8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) existing = parsed;
      } catch {
        existing = [];
      }
      existing.push(submission);
      await fs.writeFile(logPath, JSON.stringify(existing, null, 2), "utf-8");
    } catch {
      // Non-fatal persistence fallback
    }

    if (process.env.RESEND_API_KEY) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Portfolio Contact <onboarding@resend.dev>",
            to: [RECIPIENT_EMAIL],
            reply_to: cleanEmail,
            subject: `[Portfolio] ${cleanSubject}`,
            text: `From: ${cleanName} <${cleanEmail}>\n\n${cleanMessage}`,
          }),
        });
      } catch {
        // Still acknowledge captured inquiry cleanly
      }
    }

    return res.status(200).json({
      ok: true,
      recipient: RECIPIENT_EMAIL,
      submissionId: submission.id,
      receivedAt: submission.receivedAt,
    });
  });

  // Newsletter signup endpoint (ConvertKit / Mailchimp integration + local subscriber store)
  app.post("/api/newsletter", async (req, res) => {
    const { email, firstName, interest } = req.body ?? {};
    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const cleanName = typeof firstName === "string" ? firstName.trim() : "";
    const cleanInterest = typeof interest === "string" ? interest.trim() : "All Updates";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    let provider: "convertkit" | "mailchimp" | "direct-list" = "direct-list";

    const ckKey = process.env.CONVERTKIT_API_KEY;
    const ckFormId = process.env.CONVERTKIT_FORM_ID;
    if (ckKey && ckFormId) {
      try {
        const ckRes = await fetch(
          `https://api.convertkit.com/v3/forms/${encodeURIComponent(ckFormId)}/subscribe`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              api_key: ckKey,
              email: cleanEmail,
              first_name: cleanName || undefined,
              fields: { interest: cleanInterest },
            }),
            signal: AbortSignal.timeout(6000),
          }
        );
        if (ckRes.ok) {
          provider = "convertkit";
        }
      } catch {
        // Fallback to local subscriber persistence below
      }
    }

    const mcKey = process.env.MAILCHIMP_API_KEY;
    const mcAudienceId = process.env.MAILCHIMP_AUDIENCE_ID;
    if (provider === "direct-list" && mcKey && mcAudienceId && mcKey.includes("-")) {
      const dc = mcKey.split("-").pop();
      try {
        const auth = Buffer.from(`anystring:${mcKey}`).toString("base64");
        const mcRes = await fetch(
          `https://${dc}.api.mailchimp.com/3.0/lists/${encodeURIComponent(mcAudienceId)}/members`,
          {
            method: "POST",
            headers: {
              Authorization: `Basic ${auth}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email_address: cleanEmail,
              status: "subscribed",
              merge_fields: {
                FNAME: cleanName || "",
                INTEREST: cleanInterest,
              },
            }),
            signal: AbortSignal.timeout(6000),
          }
        );
        if (mcRes.ok || mcRes.status === 400) {
          provider = "mailchimp";
        }
      } catch {
        // Fallback to local subscriber persistence below
      }
    }

    const storePath = "/tmp/kalyan_newsletter_subscribers.json";
    let subscribers: Array<{
      email: string;
      firstName: string;
      interest: string;
      provider: string;
      subscribedAt: string;
    }> = [];
    try {
      const raw = await fs.readFile(storePath, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) subscribers = parsed;
    } catch {
      subscribers = [];
    }

    const alreadySubscribed = subscribers.some((sub) => sub.email === cleanEmail);
    if (!alreadySubscribed) {
      subscribers.push({
        email: cleanEmail,
        firstName: cleanName,
        interest: cleanInterest,
        provider,
        subscribedAt: new Date().toISOString(),
      });
      try {
        await fs.writeFile(storePath, JSON.stringify(subscribers, null, 2), "utf-8");
      } catch {
        // Ignore write error in read-only environments
      }
    }

    return res.status(200).json({
      ok: true,
      email: cleanEmail,
      interest: cleanInterest,
      provider,
      alreadySubscribed,
      totalSubscribers: subscribers.length,
    });
  });
}

function escapeAttr(val: string): string {
  return val
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function resolveMetaForRequest(req: Request, defaultPort = 3000) {
  const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host || `localhost:${defaultPort}`;
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
    const posts = substackCache?.data?.length ? substackCache.data : FALLBACK_SUBSTACK_POSTS;
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
          `${origin}/assets/aistudio/file_00000000101c8211a5934cb71d9606fd_e8b3c8a1.png`,
      };
    }
  }

  return {
    title: "Saragadam Kalyan | AI Engineer & Full-Stack Developer",
    description:
      "Personal website of Saragadam Kalyan — AI Engineer and Full-Stack Developer building practical LLM, RAG, agentic, and multimodal web systems.",
    type: "website",
    url: `${origin}/`,
    image: `${origin}/assets/aistudio/file_00000000101c8211a5934cb71d9606fd_e8b3c8a1.png`,
  };
}

export function injectSocialMeta(
  html: string,
  meta: Awaited<ReturnType<typeof resolveMetaForRequest>>
) {
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
