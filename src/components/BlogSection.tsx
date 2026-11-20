import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, BookOpen, RefreshCw, X } from "lucide-react";
import { PROFILE, type SubstackPost } from "../data/kalyanData";
import { highlightArticleCodeBlocks } from "../utils/prismHighlighter";

interface BlogSectionProps {
  posts: SubstackPost[];
  loading: boolean;
  errorMsg: string | null;
  onRefresh: () => void;
  activeArticle: SubstackPost | null;
  onSelectArticle: (post: SubstackPost | null) => void;
}

export default function BlogSection({
  posts,
  loading,
  errorMsg,
  onRefresh,
  activeArticle,
  onSelectArticle,
}: BlogSectionProps) {
  const proseRef = useRef<HTMLDivElement>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onSelectArticle(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onSelectArticle]);

  useEffect(() => {
    setLinkCopied(false);
    if (activeArticle && proseRef.current) {
      highlightArticleCodeBlocks(proseRef.current);
    }
  }, [activeArticle]);

  const setActiveArticle = onSelectArticle;
  const loadSubstackPosts = onRefresh;

  return (
    <section id="writing" className="bg-[#f4eff2] border-b border-black/15 py-20 md:py-28">
      <div className="editorial-wrap">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="font-mono-code text-[11px] tracking-[0.08em] text-black/75 mb-3">
              SUBSTACK PUBLICATION · SARAGADAMKALYAN.SUBSTACK.COM
            </p>
            <h2 className="text-[clamp(2.3rem,4.6vw,4rem)] font-extrabold leading-[1.03] tracking-[-0.045em] text-black">
              My writing.
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={loadSubstackPosts}
              disabled={loading}
              className="inline-flex items-center gap-1.5 font-mono-code text-xs font-semibold text-black border border-black/30 bg-white px-3.5 py-2 hover:border-black transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
              <span>{loading ? "Syncing Feed..." : "Refresh Substack"}</span>
            </button>

            <a
              href={PROFILE.links.substack}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-black border-b border-black pb-0.5 hover:text-[#4d3fab] hover:border-[#4d3fab]"
            >
              <span>Subscribe on Substack</span>
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
        </div>

        {errorMsg && (
          <p className="font-mono-code text-xs text-black/70 mb-6 border border-black/20 bg-white px-4 py-2.5">
            {errorMsg}
          </p>
        )}

        {/* Editorial 2-Column Spread (Substack Feed + KalyanHub Companion) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_0.65fr] gap-8 items-start">
          {/* Dynamic Substack Articles Column */}
          <div className="flex flex-col gap-6">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white border border-black p-6 md:p-8 shadow-[5px_5px_0_#000]"
              >
                <div className="flex flex-wrap items-center gap-2 font-mono-code text-[11px] text-black/65 mb-3">
                  <span>{post.formattedDate}</span>
                  <span aria-hidden="true">·</span>
                  <span>{post.readTimeMinutes} min read</span>
                  <span aria-hidden="true">·</span>
                  <span>{post.author}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-6 items-start">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-black mb-3">
                      <button
                        type="button"
                        onClick={() => setActiveArticle(post)}
                        className="text-left hover:text-[#4d3fab] transition-colors"
                      >
                        {post.title}
                      </button>
                    </h3>

                    <p className="text-[15px] leading-[1.65] text-black/80 mb-5">
                      {post.summary}
                    </p>

                    {post.tags.length > 0 && (
                      <p className="font-mono-code text-[11px] text-black/60 mb-5">
                        {post.tags.join(" · ")}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-5">
                      <button
                        type="button"
                        onClick={() => setActiveArticle(post)}
                        className="inline-flex items-center gap-2 bg-black text-[#f4eff2] px-5 py-2.5 text-xs font-bold border border-black hover:bg-[#dff247] hover:text-black transition-colors"
                      >
                        <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Read Full Article</span>
                      </button>

                      <a
                        href={post.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-black border-b border-black pb-0.5 hover:text-[#4d3fab]"
                      >
                        <span>View on Substack</span>
                        <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </a>
                    </div>
                  </div>

                  {post.coverImage && (
                    <button
                      type="button"
                      onClick={() => setActiveArticle(post)}
                      className="border border-black overflow-hidden bg-[#f4eff2] block w-full"
                      aria-label={`Open full article: ${post.title}`}
                    >
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-40 object-cover hover:scale-[1.03] transition-transform duration-200"
                      />
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>

          {/* Right Companion Column: Learning Archive & Profiles */}
          <aside className="bg-[#9084ff] border border-black p-6 md:p-8 shadow-[5px_5px_0_#000]">
            <p className="font-mono-code text-[10px] tracking-[0.08em] text-black/85 mb-2">
              KALYANHUB · PUBLIC ARCHIVE
            </p>
            <h3 className="text-2xl font-extrabold tracking-tight text-black mb-3">
              Notes, courses &amp; build logs.
            </h3>
            <p className="text-sm leading-relaxed text-black/85 mb-6">
              Alongside longer Substack writeups, I maintain KalyanHub — an open repository of
              certificates, engineering takeaways, and experiments across LLMs, RAG, and backend
              systems.
            </p>

            <a
              href={PROFILE.links.kalyanhub}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-black text-[#f4eff2] px-4 py-2.5 text-xs font-bold hover:bg-[#dff247] hover:text-black border border-black transition-colors mb-7"
            >
              <span>Explore KalyanHub</span>
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </a>

            <div className="border-t border-black/25 pt-5">
              <p className="font-mono-code text-[11px] font-bold text-black mb-3">
                Find me here.
              </p>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-black">
                <a
                  href={PROFILE.links.substack}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:underline underline-offset-4"
                >
                  <span>Substack</span>
                  <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
                <a
                  href={PROFILE.links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:underline underline-offset-4"
                >
                  <span>LinkedIn</span>
                  <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
                <a
                  href={PROFILE.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:underline underline-offset-4"
                >
                  <span>GitHub</span>
                  <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Full Substack Article Reader Modal */}
      {activeArticle && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="article-reader-title"
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-2 sm:p-4"
          onClick={() => setActiveArticle(null)}
        >
          <div
            className="bg-[#f4eff2] border-2 border-black shadow-[8px_8px_0_#000] max-w-3xl w-full max-h-[90vh] sm:max-h-[88vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-black bg-white shrink-0">
              <div className="font-mono-code text-[11px] text-black/70 truncate">
                {activeArticle.formattedDate} · {activeArticle.readTimeMinutes} min read ·{" "}
                {activeArticle.author}
              </div>
              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                aria-label="Close article reader"
                className="w-10 h-10 border border-black bg-[#f4eff2] flex items-center justify-center hover:bg-[#dff247] transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Article Content */}
            <div className="p-4 sm:p-6 md:p-10 overflow-y-auto">
              <h2
                id="article-reader-title"
                className="text-3xl md:text-4xl font-extrabold tracking-tight text-black mb-5"
              >
                {activeArticle.title}
              </h2>

              {activeArticle.coverImage && (
                <img
                  src={activeArticle.coverImage}
                  alt={activeArticle.title}
                  referrerPolicy="no-referrer"
                  className="w-full max-h-80 object-cover border border-black mb-6"
                />
              )}

              <div
                key={activeArticle.id}
                ref={proseRef}
                className="substack-prose"
                dangerouslySetInnerHTML={{ __html: activeArticle.contentHtml }}
              />
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-black bg-white flex flex-wrap items-center justify-between gap-4 shrink-0">
              <div className="flex flex-wrap items-center gap-4">
                <span className="font-mono-code text-[11px] text-black/65">
                  Published on saragadamkalyan.substack.com
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const shareUrl = `${window.location.origin}/blog/${encodeURIComponent(
                      activeArticle.id
                    )}`;
                    navigator.clipboard
                      ?.writeText(shareUrl)
                      .then(() => {
                        setLinkCopied(true);
                        window.setTimeout(() => setLinkCopied(false), 1800);
                      })
                      .catch(() => {});
                  }}
                  className="font-mono-code text-[11px] font-semibold text-[#4d3fab] hover:underline underline-offset-4"
                >
                  {linkCopied ? "Share link copied" : "Copy share link"}
                </button>
              </div>
              <a
                href={activeArticle.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-black text-[#f4eff2] px-4 py-2 text-xs font-bold hover:bg-[#dff247] hover:text-black border border-black transition-colors"
              >
                <span>Open Original on Substack</span>
                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
