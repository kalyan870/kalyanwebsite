import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  Award,
  BookOpen,
  FolderGit2,
  Menu,
  Search,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  CURATED_PROJECTS,
  LINKEDIN_POSTS,
  VERIFIED_CERTIFICATES,
  type CertificateItem,
  type LinkedInPostItem,
  type ProjectItem,
  type SubstackPost,
} from "../data/kalyanData";

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "AI Lab", href: "#ai-lab" },
  { label: "Resume", href: "#resume" },
  { label: "Writing", href: "#writing" },
];

interface NavbarProps {
  substackPosts: SubstackPost[];
  onSelectProject: (project: ProjectItem) => void;
  onSelectArticle: (post: SubstackPost) => void;
}

export default function Navbar({
  substackPosts,
  onSelectProject,
  onSelectArticle,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const closeDrawerButtonRef = useRef<HTMLButtonElement>(null);

  const trimmedQuery = query.trim().toLowerCase();
  const hasQuery = trimmedQuery.length > 0;

  const filteredProjects = useMemo(() => {
    if (!trimmedQuery) return [];
    return CURATED_PROJECTS.filter((p) => {
      const haystack = `${p.title} ${p.description} ${p.category} ${p.stack.join(" ")}`.toLowerCase();
      return haystack.includes(trimmedQuery);
    }).slice(0, 4);
  }, [trimmedQuery]);

  const filteredSubstack = useMemo(() => {
    if (!trimmedQuery) return [];
    return substackPosts
      .filter((post) => {
        const haystack = `${post.title} ${post.summary} ${post.tags.join(" ")}`.toLowerCase();
        return haystack.includes(trimmedQuery);
      })
      .slice(0, 3);
  }, [substackPosts, trimmedQuery]);

  const filteredLinkedInPosts = useMemo(() => {
    if (!trimmedQuery) return [];
    return LINKEDIN_POSTS.filter((post) => {
      const haystack = `${post.title} ${post.excerpt} ${post.type} ${post.tags.join(" ")}`.toLowerCase();
      return haystack.includes(trimmedQuery);
    }).slice(0, 3);
  }, [trimmedQuery]);

  const filteredCertificates = useMemo(() => {
    if (!trimmedQuery) return [];
    return VERIFIED_CERTIFICATES.filter((cert) => {
      const haystack = `${cert.title} ${cert.issuer} ${cert.code} ${cert.category}`.toLowerCase();
      return haystack.includes(trimmedQuery);
    }).slice(0, 4);
  }, [trimmedQuery]);

  const totalMatches =
    filteredProjects.length +
    filteredSubstack.length +
    filteredLinkedInPosts.length +
    filteredCertificates.length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setSearchFocused(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSearchFocused(false);
        setMobileOpen(false);
        desktopInputRef.current?.blur();
      } else if (
        event.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        event.preventDefault();
        desktopInputRef.current?.focus();
        setSearchFocused(true);
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const raf = requestAnimationFrame(() => {
      closeDrawerButtonRef.current?.focus();
    });
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileOpen]);

  const scrollToSection = (id: string) => {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleChooseProject = (project: ProjectItem) => {
    setSearchFocused(false);
    setMobileOpen(false);
    scrollToSection("projects");
    onSelectProject(project);
  };

  const handleChooseSubstack = (post: SubstackPost) => {
    setSearchFocused(false);
    setMobileOpen(false);
    scrollToSection("writing");
    onSelectArticle(post);
  };

  const handleChooseLinkedIn = (_post: LinkedInPostItem) => {
    setSearchFocused(false);
    setMobileOpen(false);
    scrollToSection("linkedin");
  };

  const handleChooseCertificate = (_cert: CertificateItem) => {
    setSearchFocused(false);
    setMobileOpen(false);
    scrollToSection("certificates");
  };

  const renderResultsList = () => (
    <div className="divide-y divide-black/15 max-h-[70vh] overflow-y-auto">
      <div className="px-4 py-2.5 bg-[#f4eff2] flex items-center justify-between gap-2 font-mono-code text-[10px] text-black/70">
        <span className="tabular-nums">
          {totalMatches} {totalMatches === 1 ? "match" : "matches"} for &ldquo;{query.trim()}&rdquo;
        </span>
        <button
          type="button"
          onClick={() => setQuery("")}
          className="underline hover:text-black font-semibold"
        >
          Clear
        </button>
      </div>

      {totalMatches === 0 ? (
        <div className="p-5 text-center">
          <p className="text-sm font-semibold text-black mb-1">No matching items found</p>
          <p className="text-xs text-black/65 m-0">
            Try searching keywords like &ldquo;RAG&rdquo;, &ldquo;Ollama&rdquo;,
            &ldquo;LLM&rdquo;, &ldquo;Databricks&rdquo;, or &ldquo;Django&rdquo;.
          </p>
        </div>
      ) : (
        <>
          {filteredProjects.length > 0 && (
            <div className="p-3">
              <p className="font-mono-code text-[10px] font-bold text-[#4d3fab] px-2 mb-1.5">
                PROJECTS
              </p>
              {filteredProjects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => handleChooseProject(project)}
                  className="w-full text-left px-2 py-2 hover:bg-[#dff247] transition-colors flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-black truncate">
                      <FolderGit2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span className="truncate">{project.title}</span>
                    </div>
                    <p className="text-[11px] text-black/70 truncate m-0">
                      {project.category} · {project.stack.join(" · ")}
                    </p>
                  </div>
                  <span className="font-mono-code text-[10px] text-black/70 shrink-0 mt-0.5">
                    Inspect
                  </span>
                </button>
              ))}
            </div>
          )}

          {(filteredSubstack.length > 0 || filteredLinkedInPosts.length > 0) && (
            <div className="p-3">
              <p className="font-mono-code text-[10px] font-bold text-[#de4ba4] px-2 mb-1.5">
                BLOG &amp; LINKEDIN POSTS
              </p>
              {filteredSubstack.map((post) => (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => handleChooseSubstack(post)}
                  className="w-full text-left px-2 py-2 hover:bg-[#dff247] transition-colors flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-black truncate">
                      <BookOpen className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span className="truncate">{post.title}</span>
                    </div>
                    <p className="text-[11px] text-black/70 truncate m-0">
                      Substack · {post.formattedDate}
                    </p>
                  </div>
                  <span className="font-mono-code text-[10px] text-black/70 shrink-0 mt-0.5">
                    Read
                  </span>
                </button>
              ))}

              {filteredLinkedInPosts.map((post) => (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => handleChooseLinkedIn(post)}
                  className="w-full text-left px-2 py-2 hover:bg-[#dff247] transition-colors flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-black truncate">
                      <BookOpen className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span className="truncate">{post.title}</span>
                    </div>
                    <p className="text-[11px] text-black/70 truncate m-0">
                      LinkedIn · {post.date}
                    </p>
                  </div>
                  <span className="font-mono-code text-[10px] text-black/70 shrink-0 mt-0.5">
                    View
                  </span>
                </button>
              ))}
            </div>
          )}

          {filteredCertificates.length > 0 && (
            <div className="p-3">
              <p className="font-mono-code text-[10px] font-bold text-black px-2 mb-1.5">
                CERTIFICATES
              </p>
              {filteredCertificates.map((cert) => (
                <div
                  key={cert.id}
                  className="px-2 py-2 hover:bg-[#dff247] transition-colors flex items-center justify-between gap-3"
                >
                  <button
                    type="button"
                    onClick={() => handleChooseCertificate(cert)}
                    className="text-left min-w-0 flex-1"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-black truncate">
                      <Award className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span className="truncate">{cert.title}</span>
                    </div>
                    <p className="text-[11px] text-black/70 truncate m-0">
                      {cert.issuer} · {cert.date}
                    </p>
                  </button>
                  <a
                    href={cert.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Verify ${cert.title}`}
                    className="font-mono-code text-[10px] font-bold text-[#4d3fab] hover:underline shrink-0 inline-flex items-center gap-0.5"
                  >
                    <span>Verify</span>
                    <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <>
      <header className="border-b border-black/20 bg-[#f4eff2] relative z-40">
        <div className="editorial-wrap h-20 md:h-[90px] flex items-center justify-between gap-6 lg:gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <a
            href="#top"
            className="text-xl md:text-2xl font-extrabold tracking-tight text-black whitespace-nowrap shrink-0 focus-visible:outline-3 focus-visible:outline-[#de4ba4] focus-visible:outline-offset-4"
          >
            Saragadam Kalyan
          </a>

          {/* Zone 2: Clean single-line text nav links */}
          <nav
            aria-label="Main navigation"
            className="hidden lg:flex items-center gap-6 text-sm font-medium text-black"
          >
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="whitespace-nowrap shrink-0 hover:underline underline-offset-[6px] decoration-1 transition-colors hover:text-[#4d3fab]"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Zone 3: Global Search Bar + Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Desktop / Tablet Search Input */}
            <div ref={searchContainerRef} className="relative hidden md:block">
              <div className="relative flex items-center">
                <Search
                  className="w-3.5 h-3.5 text-black/60 absolute left-3 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  ref={desktopInputRef}
                  type="search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSearchFocused(true);
                  }}
                  onFocus={() => setSearchFocused(true)}
                  aria-label="Search projects, blog posts, and certificates"
                  placeholder="Search projects, posts... (/)"
                  className="w-52 xl:w-64 bg-white border border-black/35 focus:border-black pl-8 pr-8 py-2 text-xs text-black placeholder:text-black/45 focus:outline-2 focus:outline-[#9084ff] focus:outline-offset-0 transition-colors"
                />
                {hasQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      desktopInputRef.current?.focus();
                    }}
                    aria-label="Clear search"
                    className="absolute right-2 text-black/60 hover:text-black p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {searchFocused && hasQuery && (
                <div
                  role="region"
                  aria-label="Search results"
                  className="absolute right-0 top-full mt-2 w-[min(380px,calc(100vw-32px))] bg-white border-2 border-black shadow-[6px_6px_0_#000] z-50"
                >
                  {renderResultsList()}
                </div>
              )}
            </div>

            <a
              href="#contact"
              className="hidden sm:inline-flex items-center gap-1.5 bg-black text-[#f4eff2] px-4 py-2.5 text-xs font-semibold tracking-tight whitespace-nowrap shrink-0 hover:bg-[#dff247] hover:text-black border border-black transition-colors duration-150"
            >
              <span>Let&apos;s connect</span>
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </a>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-slideout-menu"
              aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
              className="lg:hidden inline-flex items-center justify-center w-11 h-11 border border-black bg-[#f4eff2] text-black hover:bg-[#dff247] transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Out Hamburger Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-[70]">
            {/* Scrim Backdrop */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
              className="fixed inset-0 bg-black/50"
            />

            {/* Slide-Out Drawer Panel */}
            <motion.aside
              id="mobile-slideout-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation menu"
              initial={prefersReducedMotion ? false : { x: "100%" }}
              animate={{ x: 0 }}
              exit={prefersReducedMotion ? undefined : { x: "100%" }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }
              }
              className="fixed top-0 right-0 bottom-0 w-[min(86vw,380px)] bg-[#f4eff2] border-l-2 border-black shadow-[-8px_0_0_#000] flex flex-col overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-6 h-20 border-b border-black/20 shrink-0">
                <div>
                  <span className="font-mono-code text-[10px] font-bold tracking-[0.1em] text-[#4d3fab] block">
                    NAVIGATION
                  </span>
                  <span className="text-base font-extrabold tracking-tight text-black">
                    Saragadam Kalyan
                  </span>
                </div>
                <button
                  ref={closeDrawerButtonRef}
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close navigation menu"
                  className="inline-flex items-center justify-center w-11 h-11 border border-black bg-white text-black hover:bg-[#dff247] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="px-6 py-5 flex-1 flex flex-col gap-5">
                {/* Mobile Global Search */}
                <div>
                  <div className="relative flex items-center">
                    <Search
                      className="w-4 h-4 text-black/60 absolute left-3 pointer-events-none"
                      aria-hidden="true"
                    />
                    <input
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      aria-label="Search projects, blog posts, and certificates"
                      placeholder="Search projects, posts, certificates..."
                      className="w-full bg-white border border-black pl-9 pr-9 py-2.5 text-sm text-black placeholder:text-black/45 focus:outline-2 focus:outline-[#9084ff]"
                    />
                    {hasQuery && (
                      <button
                        type="button"
                        onClick={() => setQuery("")}
                        aria-label="Clear mobile search"
                        className="absolute right-2.5 text-black/60 hover:text-black p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {hasQuery && (
                    <div className="mt-2 bg-white border border-black shadow-[4px_4px_0_#000]">
                      {renderResultsList()}
                    </div>
                  )}
                </div>

                {/* Section Links */}
                <nav aria-label="Mobile sections" className="flex flex-col divide-y divide-black/15 border-y border-black/15">
                  {NAV_LINKS.map((item, idx) => (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="group py-3.5 flex items-center justify-between text-base font-bold text-black hover:text-[#4d3fab] transition-colors"
                    >
                      <span className="inline-flex items-center gap-3">
                        <span className="font-mono-code text-[11px] text-black/45 tabular-nums">
                          0{idx + 1}
                        </span>
                        <span>{item.label}</span>
                      </span>
                      <ArrowUpRight
                        className="w-4 h-4 text-black/45 group-hover:text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                        aria-hidden="true"
                      />
                    </a>
                  ))}
                </nav>
              </div>

              {/* Drawer Footer Actions */}
              <div className="px-6 py-5 border-t border-black/20 bg-white flex flex-col gap-2.5 shrink-0">
                <a
                  href="#contact"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center gap-2 bg-black text-[#f4eff2] border border-black px-5 py-3 text-sm font-semibold hover:bg-[#dff247] hover:text-black transition-colors"
                >
                  <span>Let&apos;s connect</span>
                  <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                </a>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
