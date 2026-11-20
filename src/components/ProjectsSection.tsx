import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Bookmark,
  Check,
  Clock,
  Copy,
  ExternalLink,
  FolderGit2,
  Search,
  Share2,
  X,
} from "lucide-react";
import {
  CURATED_PROJECTS,
  PROFILE,
  type ProjectCategory,
  type ProjectItem,
} from "../data/kalyanData";

const BOOKMARKS_STORAGE_KEY = "kalyan_saved_projects_v1";

const CATEGORIES: ProjectCategory[] = [
  "All",
  "RAG & LLMs",
  "AI Agents",
  "Multimodal & CV",
  "Full-Stack",
];

interface LiveRepoMeta {
  stars: number;
  language: string | null;
  updatedAt: string;
}

interface ProjectsSectionProps {
  selectedProject: ProjectItem | null;
  onSelectProject: (project: ProjectItem | null) => void;
}

export default function ProjectsSection({
  selectedProject,
  onSelectProject,
}: ProjectsSectionProps) {
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
    } catch {
      return [];
    }
  });
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedOnly, setSavedOnly] = useState(false);
  const [liveMeta, setLiveMeta] = useState<Record<string, LiveRepoMeta>>({});
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "shared">("idle");

  const toggleProjectBookmark = (project: ProjectItem) => {
    setSavedIds((prev) => {
      const next = prev.includes(project.id)
        ? prev.filter((id) => id !== project.id)
        : [...prev, project.id];
      try {
        localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage quota errors
      }
      return next;
    });
  };

  useEffect(() => {
    setShareStatus("idle");
  }, [selectedProject?.id]);

  useEffect(() => {
    let active = true;
    fetch("/api/github-projects")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.repos) {
          setLiveMeta(data.repos);
        }
      })
      .catch(() => {
        // Silent fallback to curated static metadata
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onSelectProject(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onSelectProject]);

  const setSelectedProject = onSelectProject;

  const featuredProject = CURATED_PROJECTS.find((p) => p.featured) ?? CURATED_PROJECTS[0];
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const bookmarkedIds = useMemo(() => new Set(savedIds), [savedIds]);

  const gridProjects = useMemo(() => {
    return CURATED_PROJECTS.filter((project) => {
      if (savedOnly && !bookmarkedIds.has(project.id)) return false;

      const matchesCategory =
        selectedCategory === "All"
          ? savedOnly || normalizedQuery.length > 0 || project.id !== featuredProject.id
          : project.category === selectedCategory;

      if (!matchesCategory) return false;
      if (!normalizedQuery) return true;

      const searchable = [
        project.title,
        project.category,
        project.description,
        project.architectureNote,
        ...project.stack,
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(normalizedQuery);
    });
  }, [bookmarkedIds, featuredProject.id, normalizedQuery, savedOnly, selectedCategory]);

  const getRepoStats = (slug: string) => liveMeta[slug.toLowerCase()];

  const formatLastUpdated = (project: ProjectItem): string | null => {
    const liveIso = getRepoStats(project.repoSlug)?.updatedAt;
    if (liveIso) {
      const parsed = new Date(liveIso);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }
    }
    return project.lastUpdated ?? null;
  };

  return (
    <section id="projects" className="bg-[#f4eff2] border-b border-black/15 py-20 md:py-28">
      <div className="editorial-wrap">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <p className="font-mono-code text-[11px] tracking-[0.08em] text-black/75 mb-3">
              OPEN SOURCE · GITHUB.COM/KALYAN870
            </p>
            <h2
              className="text-[clamp(2.2rem,4.5vw,3.9rem)] font-extrabold leading-[1.03] tracking-[-0.045em] text-black"
              style={{ textWrap: "balance" }}
            >
              Curated GitHub <span className="bg-[#dff247] px-2 inline-block">projects.</span>
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <p className="text-sm text-black/75 max-w-xs leading-relaxed">
              Practical AI systems, local SLM benchmarks, and full-stack products with inspectable
              source code.
            </p>
            <a
              href={PROFILE.links.githubRepos}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-black border-b border-black pb-0.5 hover:text-[#4d3fab] hover:border-[#4d3fab] whitespace-nowrap shrink-0 self-start sm:self-auto"
            >
              <span>All 51+ repositories</span>
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Signature Black Feature Block (Matching Reference Course Block) */}
        <div className="bg-black text-[#f4eff2] border border-black p-7 md:p-10 mb-12 grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8 items-center">
          <div>
            <div className="flex flex-wrap items-center gap-4 mb-5">
              <span className="font-mono-code text-[10px] tracking-[0.08em] border border-[#9084ff] text-[#9084ff] px-2.5 py-1">
                FLAGSHIP BUILD
              </span>
              {formatLastUpdated(featuredProject) && (
                <span className="font-mono-code text-[10px] tracking-[0.06em] border border-white/25 text-[#dff247] px-2.5 py-1 inline-flex items-center gap-1.5 tabular-nums">
                  <Clock className="w-3 h-3" aria-hidden="true" />
                  <span>UPDATED {formatLastUpdated(featuredProject)}</span>
                </span>
              )}
              <span className="font-mono-code text-xs text-[#f4eff2]/70">
                {featuredProject.category} · {featuredProject.stack.join(" · ")}
              </span>
            </div>

            <h3 className="text-3xl md:text-5xl font-extrabold tracking-[-0.04em] text-[#f4eff2] mb-4">
              {featuredProject.title}
            </h3>

            <p className="text-[15.5px] leading-[1.65] text-[#f4eff2]/80 max-w-xl mb-6">
              {featuredProject.description}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href={featuredProject.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#dff247] text-black px-5 py-3 text-xs font-bold border border-[#dff247] hover:bg-[#f4eff2] hover:border-[#f4eff2] transition-colors whitespace-nowrap shrink-0"
              >
                <span>View Repository</span>
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </a>

              <button
                type="button"
                onClick={() => setSelectedProject(featuredProject)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#f4eff2] border-b border-[#f4eff2]/60 pb-0.5 hover:text-[#dff247] hover:border-[#dff247] transition-colors whitespace-nowrap shrink-0"
              >
                <span>Inspect Architecture</span>
              </button>
            </div>
          </div>

          <div className="border-t lg:border-t-0 lg:border-l border-white/20 pt-6 lg:pt-0 lg:pl-8">
            <p className="font-mono-code text-[11px] tracking-[0.08em] text-[#9084ff] mb-4">
              IMPLEMENTED WORKFLOWS
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 font-mono-code text-xs text-[#f4eff2]/90">
              <div className="flex items-start gap-2">
                <span className="text-[#dff247]" aria-hidden="true">
                  ↳
                </span>
                <span>Dynamic task routing &amp; DAG flows</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#dff247]" aria-hidden="true">
                  ↳
                </span>
                <span>Multi-provider LLM fallback</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#dff247]" aria-hidden="true">
                  ↳
                </span>
                <span>Real-time SSE execution tracing</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#dff247]" aria-hidden="true">
                  ↳
                </span>
                <span>Containerized Docker deployment</span>
              </div>
            </div>
          </div>
        </div>

        {/* Project Search Bar + Category Filter Toolbar */}
        <div className="mb-8 pb-5 border-b border-black/15 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-xl">
              <Search
                className="w-4 h-4 text-black/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="project-search-input"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search projects by title or technology"
                placeholder="Search projects by title or tech (e.g., LangGraph, FastAPI, Qdrant, Ollama)..."
                className="w-full bg-white border border-black pl-10 pr-10 py-2.5 text-sm text-black placeholder:text-black/45 shadow-[3px_3px_0_#000] focus:outline-3 focus:outline-[#9084ff] focus:outline-offset-0"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear project search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-black/60 hover:text-black"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <span className="font-mono-code text-xs text-black/70 tabular-nums shrink-0">
              Showing {gridProjects.length} {gridProjects.length === 1 ? "project" : "projects"}
              {normalizedQuery ? ` matching "${searchQuery.trim()}"` : ""}
            </span>
          </div>

          {/* Interactive Category Filter Bar */}
          <div
            role="tablist"
            aria-label="Filter projects by category"
            className="flex flex-wrap items-center gap-2"
          >
            {CATEGORIES.map((category) => {
              const isActive = selectedCategory === category && !savedOnly;
              return (
                <button
                  key={category}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  onClick={() => {
                    setSavedOnly(false);
                    setSelectedCategory(category);
                  }}
                  className={`px-4 py-2 text-xs font-semibold border transition-colors duration-150 whitespace-nowrap shrink-0 ${
                    isActive
                      ? "bg-black text-[#f4eff2] border-black"
                      : "bg-white text-black border-black/25 hover:border-black"
                  }`}
                >
                  {category}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setSavedOnly((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 ${
                savedOnly
                  ? "bg-[#9084ff] text-black border-black"
                  : "bg-white text-black border-black/25 hover:border-black"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Saved ({savedIds.length})</span>
            </button>
          </div>
        </div>

        {/* Curated Repository Cards Grid */}
        {gridProjects.length === 0 ? (
          <div className="bg-white border border-black p-8 text-center shadow-[5px_5px_0_#000]">
            <p className="text-base font-extrabold text-black mb-1">
              No projects match &ldquo;{searchQuery.trim()}&rdquo;
              {selectedCategory !== "All" ? ` in ${selectedCategory}` : ""}
            </p>
            <p className="text-sm text-black/70 mb-5">
              Try keywords like Python, FastAPI, LangGraph, RAG, Ollama, or Docker.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="inline-flex items-center gap-2 bg-[#dff247] text-black px-5 py-2.5 text-xs font-bold border border-black hover:bg-[#9084ff] transition-colors"
            >
              <span>Reset project filters</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gridProjects.map((project, index) => {
              const stats = getRepoStats(project.repoSlug);
              return (
                <article
                  key={project.id}
                  className="group bg-white border border-black p-6 flex flex-col justify-between shadow-[2px_2px_0_#000] transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:-translate-x-0.5 hover:shadow-[8px_8px_0_#000] focus-within:-translate-y-1 focus-within:shadow-[8px_8px_0_#000] motion-reduce:transition-none motion-reduce:hover:transform-none"
                >
                  <div>
                    {/* Clean Unboxed Metadata (Zero-Pill Rule) */}
                    <div className="flex items-center justify-between gap-2 font-mono-code text-[11px] text-black/65 mb-3">
                      <span className="transition-colors duration-200 group-hover:text-black">
                        {String(index + 1).padStart(2, "0")} · {project.category}
                      </span>
                      {stats?.language && (
                        <span className="text-[#4d3fab] font-semibold">{stats.language}</span>
                      )}
                    </div>

                    <h3 className="text-xl font-extrabold tracking-tight text-black mb-2.5">
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group-hover:text-[#4d3fab] hover:underline underline-offset-4 transition-colors duration-150"
                      >
                        {project.title}
                      </a>
                    </h3>

                    <p className="text-sm leading-[1.6] text-black/80 mb-4">{project.description}</p>
                  </div>

                  <div>
                    {/* Tech-Stack Badges & Last Updated Stamp */}
                    <div className="border-t border-black/10 pt-3 mb-4 space-y-2.5">
                      <div
                        className="flex flex-wrap items-center gap-1.5"
                        aria-label={`${project.title} technology stack`}
                      >
                        {project.stack.map((tech) => (
                          <span
                            key={tech}
                            className="font-mono-code text-[10px] font-semibold text-black border border-black/30 bg-[#f4eff2] px-2 py-0.5 whitespace-nowrap transition-colors duration-150 group-hover:border-black group-hover:bg-white"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>

                      {formatLastUpdated(project) && (
                        <div>
                          <span className="font-mono-code text-[10px] font-semibold text-black/75 border border-black/25 bg-[#f4eff2] px-2 py-0.5 inline-flex items-center gap-1 tabular-nums whitespace-nowrap shrink-0 transition-colors duration-200 group-hover:bg-[#dff247] group-hover:border-black group-hover:text-black">
                            <Clock className="w-3 h-3 text-[#4d3fab] group-hover:text-black transition-colors duration-200" aria-hidden="true" />
                            <span>Updated {formatLastUpdated(project)}</span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Hover-Reveal CTA Buttons + Details Trigger */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-black/10 min-h-[40px]">
                      <div className="flex flex-wrap items-center gap-2 md:opacity-0 md:translate-y-1 md:pointer-events-none md:group-hover:opacity-100 md:group-hover:translate-y-0 md:group-hover:pointer-events-auto md:group-focus-within:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:pointer-events-auto transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none">
                        <a
                          href={project.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 bg-black text-[#f4eff2] border border-black px-3 py-1.5 text-[11px] font-bold hover:bg-[#dff247] hover:text-black transition-colors whitespace-nowrap"
                        >
                          <FolderGit2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>View Repository</span>
                          <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                        </a>

                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 bg-[#9084ff] text-black border border-black px-3 py-1.5 text-[11px] font-bold hover:bg-[#dff247] transition-colors whitespace-nowrap"
                          >
                            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Live Demo</span>
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-3 ml-auto">
                        <button
                          type="button"
                          onClick={() => toggleProjectBookmark(project)}
                          aria-label={
                            bookmarkedIds.has(project.id)
                              ? `Remove ${project.title} from saved projects`
                              : `Save ${project.title}`
                          }
                          className={`inline-flex items-center gap-1 font-mono-code text-[11px] font-semibold px-2 py-0.5 border transition-colors ${
                            bookmarkedIds.has(project.id)
                              ? "bg-[#dff247] text-black border-black"
                              : "bg-white text-black/70 border-black/25 hover:border-black hover:text-black"
                          }`}
                        >
                          <Bookmark className="w-3 h-3" aria-hidden="true" />
                          <span>{bookmarkedIds.has(project.id) ? "Saved" : "Save"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedProject(project)}
                          className="font-mono-code text-[11px] font-semibold text-black/75 hover:text-[#4d3fab] underline underline-offset-4"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Project Architecture Detail Modal */}
      {selectedProject && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-modal-title"
          className="fixed inset-0 z-50 bg-black/65 flex items-center justify-center p-4"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="bg-[#f4eff2] border-2 border-black shadow-[8px_8px_0_#000] max-w-xl w-full p-6 md:p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedProject(null)}
              aria-label="Close project details"
              className="absolute top-4 right-4 w-10 h-10 border border-black bg-white flex items-center justify-center hover:bg-[#dff247] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-wrap items-center gap-3 mb-2 pr-10">
              <p className="font-mono-code text-[11px] font-semibold text-[#4d3fab] m-0">
                {selectedProject.category} · {selectedProject.stack.join(" · ")}
              </p>
              {formatLastUpdated(selectedProject) && (
                <span className="font-mono-code text-[10px] font-semibold text-black/75 border border-black/25 bg-white px-2 py-0.5 inline-flex items-center gap-1 tabular-nums">
                  <Clock className="w-3 h-3 text-[#de4ba4]" aria-hidden="true" />
                  <span>Updated {formatLastUpdated(selectedProject)}</span>
                </span>
              )}
            </div>
            <h3
              id="project-modal-title"
              className="text-2xl md:text-3xl font-extrabold tracking-tight text-black mb-4 pr-10"
            >
              {selectedProject.title}
            </h3>

            <p className="text-[15px] leading-[1.65] text-black/85 mb-5">
              {selectedProject.description}
            </p>

            <div className="bg-white border border-black p-4 mb-6">
              <p className="font-mono-code text-[11px] font-bold text-black mb-1.5">
                ARCHITECTURE &amp; ENGINEERING NOTES
              </p>
              <p className="text-sm leading-relaxed text-black/80 m-0">
                {selectedProject.architectureNote}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-black/15">
              <a
                href={selectedProject.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-black text-[#f4eff2] px-5 py-3 text-xs font-bold hover:bg-[#dff247] hover:text-black border border-black transition-colors"
              >
                <span>Open GitHub Repository</span>
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </a>

              {selectedProject.liveUrl && (
                <a
                  href={selectedProject.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-black px-5 py-3 text-xs font-bold border border-black hover:bg-[#9084ff] transition-colors"
                >
                  <span>Open Live Deployment</span>
                  <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                </a>
              )}

              <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                <button
                  type="button"
                  onClick={async () => {
                    const shareUrl = `${window.location.origin}/projects/${encodeURIComponent(
                      selectedProject.id
                    )}`;
                    if (typeof navigator.share === "function") {
                      try {
                        await navigator.share({
                          title: `${selectedProject.title} — Saragadam Kalyan`,
                          text: selectedProject.description,
                          url: shareUrl,
                        });
                        setShareStatus("shared");
                        window.setTimeout(() => setShareStatus("idle"), 2000);
                        return;
                      } catch (err) {
                        if (err instanceof DOMException && err.name === "AbortError") {
                          return;
                        }
                      }
                    }
                    try {
                      await navigator.clipboard?.writeText(shareUrl);
                      setShareStatus("copied");
                      window.setTimeout(() => setShareStatus("idle"), 2000);
                    } catch {
                      // Ignore clipboard failure in restricted iframes
                    }
                  }}
                  className="inline-flex items-center gap-1.5 bg-[#9084ff] text-black px-4 py-2.5 text-xs font-bold border border-black hover:bg-[#dff247] transition-colors whitespace-nowrap"
                >
                  <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{shareStatus === "shared" ? "Shared" : "Share"}</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    const shareUrl = `${window.location.origin}/projects/${encodeURIComponent(
                      selectedProject.id
                    )}`;
                    try {
                      await navigator.clipboard?.writeText(shareUrl);
                      setShareStatus("copied");
                      window.setTimeout(() => setShareStatus("idle"), 2000);
                    } catch {
                      // Ignore clipboard failure in restricted iframes
                    }
                  }}
                  aria-label="Copy project share URL to clipboard"
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold border border-black transition-colors whitespace-nowrap ${
                    shareStatus === "copied"
                      ? "bg-[#dff247] text-black"
                      : "bg-white text-black hover:bg-[#dff247]"
                  }`}
                >
                  {shareStatus === "copied" ? (
                    <>
                      <Check className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Copied Link</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
