import { useCallback, useEffect, useState } from "react";
import AboutSection from "./components/AboutSection";
import AiLabSection from "./components/AiLabSection";
import BlogSection from "./components/BlogSection";
import CertificatesSection from "./components/CertificatesSection";
import ContactSection from "./components/ContactSection";
import FeaturedSection from "./components/FeaturedSection";
import FocusDimensions from "./components/FocusDimensions";
import Footer from "./components/Footer";
import GitHubActivitySection from "./components/GitHubActivitySection";
import HeroSection from "./components/HeroSection";
import LabVaultSection from "./components/LabVaultSection";
import LinkedInSection from "./components/LinkedInSection";
import Navbar from "./components/Navbar";
import NewsletterSection from "./components/NewsletterSection";
import ProjectsSection from "./components/ProjectsSection";
import ReadingProgressBar from "./components/ReadingProgressBar";
import ResumeSection from "./components/ResumeSection";
import {
  CURATED_PROJECTS,
  FALLBACK_SUBSTACK_POSTS,
  type ProjectItem,
  type SubstackPost,
} from "./data/kalyanData";
import {
  applySocialMeta,
  buildArticleMeta,
  buildDefaultMeta,
  buildProjectMeta,
} from "./utils/socialMeta";

function parseRouteFromLocation(): { projectSlug: string | null; postSlug: string | null } {
  const path = window.location.pathname;
  const params = new URLSearchParams(window.location.search);

  const projectMatch = path.match(/^\/projects\/([^/]+)\/?$/);
  const blogMatch = path.match(/^\/blog\/([^/]+)\/?$/);

  return {
    projectSlug: projectMatch ? decodeURIComponent(projectMatch[1]) : params.get("project"),
    postSlug: blogMatch ? decodeURIComponent(blogMatch[1]) : params.get("post"),
  };
}

export default function App() {
  const [animationsPaused, setAnimationsPaused] = useState(false);

  const [substackPosts, setSubstackPosts] = useState<SubstackPost[]>(FALLBACK_SUBSTACK_POSTS);
  const [substackLoading, setSubstackLoading] = useState(true);
  const [substackError, setSubstackError] = useState<string | null>(null);

  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(() => {
    const { projectSlug } = parseRouteFromLocation();
    if (!projectSlug) return null;
    return (
      CURATED_PROJECTS.find(
        (p) =>
          p.id.toLowerCase() === projectSlug.toLowerCase() ||
          p.repoSlug.toLowerCase() === projectSlug.toLowerCase()
      ) ?? null
    );
  });

  const [activeArticle, setActiveArticle] = useState<SubstackPost | null>(() => {
    const { postSlug } = parseRouteFromLocation();
    if (!postSlug) return null;
    return (
      FALLBACK_SUBSTACK_POSTS.find(
        (post) => post.id.toLowerCase() === postSlug.toLowerCase()
      ) ?? null
    );
  });

  const loadSubstackPosts = useCallback(async () => {
    setSubstackLoading(true);
    setSubstackError(null);
    try {
      const response = await fetch("/api/substack");
      const data = await response.json();
      if (response.ok && Array.isArray(data?.posts) && data.posts.length > 0) {
        setSubstackPosts(data.posts);
        const { postSlug } = parseRouteFromLocation();
        if (postSlug) {
          const matched = data.posts.find(
            (post: SubstackPost) => post.id.toLowerCase() === postSlug.toLowerCase()
          );
          if (matched) setActiveArticle(matched);
        }
      } else if (!response.ok) {
        setSubstackError("Showing cached Substack snapshot while live feed reconnects.");
      }
    } catch {
      setSubstackError("Showing cached Substack snapshot while live feed reconnects.");
    } finally {
      setSubstackLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubstackPosts();
  }, [loadSubstackPosts]);

  // Sync dynamic Open Graph / Twitter Card tags on state change
  useEffect(() => {
    const origin = window.location.origin;
    if (activeArticle) {
      applySocialMeta(buildArticleMeta(activeArticle, origin));
    } else if (selectedProject) {
      applySocialMeta(buildProjectMeta(selectedProject, origin));
    } else {
      applySocialMeta(buildDefaultMeta(origin));
    }
  }, [activeArticle, selectedProject]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const onPopState = () => {
      const { projectSlug, postSlug } = parseRouteFromLocation();
      if (projectSlug) {
        const proj =
          CURATED_PROJECTS.find(
            (p) =>
              p.id.toLowerCase() === projectSlug.toLowerCase() ||
              p.repoSlug.toLowerCase() === projectSlug.toLowerCase()
          ) ?? null;
        setSelectedProject(proj);
        setActiveArticle(null);
      } else if (postSlug) {
        const art =
          substackPosts.find((p) => p.id.toLowerCase() === postSlug.toLowerCase()) ?? null;
        setActiveArticle(art);
        setSelectedProject(null);
      } else {
        setSelectedProject(null);
        setActiveArticle(null);
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [substackPosts]);

  const handleSelectProject = useCallback((project: ProjectItem | null) => {
    setSelectedProject(project);
    if (project) {
      setActiveArticle(null);
      window.history.pushState(null, "", `/projects/${encodeURIComponent(project.id)}`);
    } else {
      window.history.pushState(null, "", "/");
    }
  }, []);

  const handleSelectArticle = useCallback((article: SubstackPost | null) => {
    setActiveArticle(article);
    if (article) {
      setSelectedProject(null);
      window.history.pushState(null, "", `/blog/${encodeURIComponent(article.id)}`);
    } else {
      window.history.pushState(null, "", "/");
    }
  }, []);

  return (
    <div className={animationsPaused ? "animations-paused min-h-screen" : "min-h-screen"}>
      <ReadingProgressBar />

      <a
        href="#main"
        className="fixed -top-24 left-4 z-50 bg-[#dff247] border border-black px-4 py-2 text-xs font-bold text-black focus:top-3"
      >
        Skip to content
      </a>

      <Navbar
        substackPosts={substackPosts}
        onSelectProject={handleSelectProject}
        onSelectArticle={handleSelectArticle}
      />

      <main id="main">
        <HeroSection />
        <AboutSection />
        <FocusDimensions />
        <ProjectsSection
          selectedProject={selectedProject}
          onSelectProject={handleSelectProject}
        />
        <AiLabSection />
        <GitHubActivitySection />
        <LinkedInSection />
        <CertificatesSection />
        <ResumeSection />
        <FeaturedSection />
        <BlogSection
          posts={substackPosts}
          loading={substackLoading}
          errorMsg={substackError}
          onRefresh={loadSubstackPosts}
          activeArticle={activeArticle}
          onSelectArticle={handleSelectArticle}
        />
        <NewsletterSection />
        <LabVaultSection />
        <ContactSection />
      </main>

      <Footer
        animationsPaused={animationsPaused}
        onToggleAnimations={() => setAnimationsPaused((prev) => !prev)}
      />
    </div>
  );
}
