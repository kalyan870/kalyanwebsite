import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Award, Check, Copy, ExternalLink } from "lucide-react";
import {
  PROFILE,
  VERIFIED_CERTIFICATES,
  type CertificateCategory,
  type CertificateItem,
} from "../data/kalyanData";

const CERT_CATEGORIES: CertificateCategory[] = [
  "All",
  "AI & Cloud",
  "Full-Stack & Data",
  "Simulations",
];

const PORTFOLIO_EDITIONS = [
  {
    id: "kalyannexus",
    title: "KalyanNexus Portfolio",
    subtitle: "Generative AI Engineer · Dark Edition",
    domain: "kalyannexus.vercel.app",
    url: "https://kalyannexus.vercel.app/",
    description:
      "Obsidian dark-mode showcase highlighting LLM applications, RAG architectures, autonomous AI agents, and interactive engineering demos.",
    accent: "#ccff00",
    secondary: "#38bdf8",
    stackLine: "React · Dark UI · Generative AI Showcase",
  },
  {
    id: "kalyanportfolio",
    title: "KalyanPortfolio v5",
    subtitle: "AI Systems & Full-Stack Showcase",
    domain: "kalyanportfolio-five.vercel.app",
    url: "https://kalyanportfolio-five.vercel.app/",
    description:
      "Streamlined developer portfolio built for fast recruiter and collaborator scanning across AI engineering projects and technical stack.",
    accent: "#9084ff",
    secondary: "#de4ba4",
    stackLine: "React · Vite · Full-Stack & AI Focus",
  },
];

const SHOWCASE_HIGHLIGHTS = [
  {
    index: "01",
    label: "PRODUCTION RAG",
    title: "Production RAG Search",
    note: "Hybrid vector + keyword document Q&A with reranking.",
    url: "https://production-rag-application.vercel.app/",
  },
  {
    index: "02",
    label: "AGENTIC AI",
    title: "AI Automation Agent",
    note: "Multi-step workflow orchestrator with structured tool execution.",
    url: "https://ai-automation-agent-phi.vercel.app/",
  },
  {
    index: "03",
    label: "LOCAL SLMs",
    title: "Local SLM Ollama Lab",
    note: "Offline benchmark runner for Qwen, Mistral, Llama, Phi, and Gemma.",
    url: "https://local-slm-ollama-lab.vercel.app/",
  },
  {
    index: "04",
    label: "PYPI PACKAGE",
    title: "django-fetch-guard",
    note: "Strict ORM fetch contracts and automatic N+1 prevention for Django.",
    url: "https://pypi.org/project/django-fetch-guard/",
  },
];

function formatSingleCitation(cert: CertificateItem): string {
  return `${PROFILE.name}, "${cert.title}," ${cert.issuer}, ${cert.date} (Credential ID: ${cert.code}). Verify: ${cert.url}`;
}

function formatCollectionCitation(
  certs: CertificateItem[],
  category: CertificateCategory
): string {
  const scopeLabel = category === "All" ? "All Tracks" : category;
  const header = `${PROFILE.name} — Verified Certifications (${scopeLabel}, ${certs.length}):`;
  const lines = certs.map(
    (cert, index) =>
      `${index + 1}. "${cert.title}" — ${cert.issuer} (${cert.date}) | ID: ${cert.code} | Verify: ${cert.url}`
  );
  return [header, ...lines].join("\n");
}

async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback below for restricted iframe contexts
    }
  }
  if (typeof document === "undefined") return false;
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";
  document.body.appendChild(textarea);
  textarea.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(textarea);
  return ok;
}

export default function CertificatesSection() {
  const [activeCategory, setActiveCategory] = useState<CertificateCategory>("All");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copyTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const filteredCerts = VERIFIED_CERTIFICATES.filter((cert) =>
    activeCategory === "All" ? true : cert.category === activeCategory
  );

  const handleCopy = async (id: string, text: string) => {
    const ok = await copyTextToClipboard(text);
    if (!ok) return;
    setCopiedId(id);
    if (copyTimerRef.current !== null) {
      window.clearTimeout(copyTimerRef.current);
    }
    copyTimerRef.current = window.setTimeout(() => {
      setCopiedId((current) => (current === id ? null : current));
    }, 2000);
  };

  return (
    <section
      id="certificates"
      className="bg-[#f4eff2] border-b border-black/15 py-20 md:py-28"
    >
      <div className="editorial-wrap">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <p className="font-mono-code text-[11px] tracking-[0.08em] text-black/75 mb-3">
              CREDENTIALS &amp; DEPLOYED SHOWCASE
            </p>
            <h2
              className="text-[clamp(2.2rem,4.5vw,3.9rem)] font-extrabold leading-[1.03] tracking-[-0.045em] text-black"
              style={{ textWrap: "balance" }}
            >
              Certificates &amp; <span className="bg-[#de4ba4] text-black px-2 inline-block">showcase.</span>
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <p className="text-sm text-black/75 max-w-xs leading-relaxed">
              Verified credentials from Databricks, AWS, Anthropic, Google Cloud, Forage, and HCL
              GUVI alongside live portfolio editions and deployed builds.
            </p>
            <a
              href={PROFILE.links.kalyanhub}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-black border-b border-black pb-0.5 hover:text-[#4d3fab] hover:border-[#4d3fab] whitespace-nowrap shrink-0 self-start sm:self-auto"
            >
              <span>Full archive on KalyanHub</span>
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Visual Portfolio Editions Showcase (Snapshots, not full embeds) */}
        <div className="mb-14">
          <div className="flex items-center justify-between border-b border-black/20 pb-3 mb-5">
            <span className="font-mono-code text-xs font-bold text-black">
              PORTFOLIO EDITIONS SHOWCASE
            </span>
            <span className="font-mono-code text-[11px] text-black/60">
              Visual previews of live portfolio sites
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {PORTFOLIO_EDITIONS.map((edition) => (
              <article
                key={edition.id}
                className="bg-white border border-black shadow-[6px_6px_0_#000] flex flex-col justify-between overflow-hidden"
              >
                {/* Visual Mini-Browser Preview Canvas */}
                <a
                  href={edition.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open ${edition.title} live portfolio`}
                  className="group block bg-[#090B10] border-b border-black relative overflow-hidden"
                >
                  {/* Browser Bar */}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-[#121620] border-b border-white/10">
                    <div className="flex items-center gap-1.5" aria-hidden="true">
                      <span className="w-2.5 h-2.5 rounded-full bg-white/25 inline-block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-white/25 inline-block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-white/25 inline-block" />
                    </div>
                    <span className="font-mono-code text-[11px] text-white/75 truncate px-3">
                      {edition.domain}
                    </span>
                    <ArrowUpRight
                      className="w-3.5 h-3.5 text-white/60 group-hover:text-white transition-colors"
                      aria-hidden="true"
                    />
                  </div>

                  {/* Stylized Portfolio Hero Visual Preview */}
                  <div className="p-6 md:p-7 relative">
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage:
                          "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)",
                        backgroundSize: "24px 24px",
                      }}
                    />

                    <div className="relative z-10 grid grid-cols-1 sm:grid-cols-[1.25fr_0.75fr] gap-5 items-center">
                      <div>
                        <span
                          className="font-mono-code text-[10px] tracking-[0.1em] block mb-2"
                          style={{ color: edition.accent }}
                        >
                          PORTFOLIO SNAPSHOT
                        </span>
                        <p className="text-xl md:text-2xl font-extrabold tracking-tight text-white mb-1.5">
                          Saragadam Kalyan
                        </p>
                        <p className="text-xs text-white/70 mb-4 m-0">
                          {edition.subtitle}
                        </p>
                        <span
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-black"
                          style={{ backgroundColor: edition.accent }}
                        >
                          <span>Launch Portfolio</span>
                          <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                        </span>
                      </div>

                      {/* Mini Visual Layout Blocks representing Portfolio Modules */}
                      <div className="space-y-2" aria-hidden="true">
                        <div className="border border-white/15 bg-white/5 p-2.5">
                          <div
                            className="h-1.5 w-10 mb-1.5"
                            style={{ backgroundColor: edition.accent }}
                          />
                          <div className="h-2 w-24 bg-white/80 mb-1" />
                          <div className="h-1.5 w-16 bg-white/35" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="border border-white/15 bg-white/5 p-2">
                            <div
                              className="h-1.5 w-6 mb-1"
                              style={{ backgroundColor: edition.secondary }}
                            />
                            <div className="h-1.5 w-12 bg-white/60" />
                          </div>
                          <div className="border border-white/15 bg-white/5 p-2">
                            <div
                              className="h-1.5 w-6 mb-1"
                              style={{ backgroundColor: edition.accent }}
                            />
                            <div className="h-1.5 w-12 bg-white/60" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </a>

                {/* Card Copy & Direct Link */}
                <div className="p-6 flex flex-col justify-between flex-1">
                  <div>
                    <div className="flex items-center justify-between gap-2 font-mono-code text-[11px] text-black/65 mb-2">
                      <span>{edition.stackLine}</span>
                    </div>
                    <h3 className="text-xl font-extrabold tracking-tight text-black mb-2">
                      {edition.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-black/80 mb-5">
                      {edition.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-black/15 flex items-center justify-between gap-4">
                    <span className="font-mono-code text-[11px] text-black/60 truncate">
                      {edition.url}
                    </span>
                    <a
                      href={edition.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-black text-[#f4eff2] px-4 py-2 text-xs font-bold border border-black hover:bg-[#dff247] hover:text-black transition-colors whitespace-nowrap shrink-0"
                    >
                      <span>Visit Live Site</span>
                      <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Deployed Showcase Strip (4 Live Highlight Tiles) */}
        <div className="mb-14">
          <div className="flex items-center justify-between border-b border-black/20 pb-3 mb-5">
            <span className="font-mono-code text-xs font-bold text-black">
              LIVE DEPLOYMENT SHOWCASE
            </span>
            <span className="font-mono-code text-[11px] text-black/60">
              Click any card to open the live app
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SHOWCASE_HIGHLIGHTS.map((item) => (
              <a
                key={item.index}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-[#9084ff] border border-black p-5 flex flex-col justify-between shadow-[4px_4px_0_#000] hover:bg-[#dff247] transition-colors duration-150"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 font-mono-code text-[10px] font-bold text-black/80 mb-3">
                    <span>
                      {item.index} · {item.label}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-extrabold tracking-tight text-black mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-black/85 mb-4">{item.note}</p>
                </div>
                <span className="font-mono-code text-[11px] font-bold text-black group-hover:underline underline-offset-4 inline-flex items-center gap-1">
                  <span>Open Live Deployment</span>
                  <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Certificates Filter Bar + Copy Citation Action */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8 pb-4 border-b border-black/15">
          <div
            role="tablist"
            aria-label="Filter certificates by track"
            className="flex flex-wrap items-center gap-2"
          >
            {CERT_CATEGORIES.map((category) => {
              const isActive = activeCategory === category;
              return (
                <button
                  key={category}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  onClick={() => setActiveCategory(category)}
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
          </div>

          <div className="flex flex-wrap items-center gap-3 ml-auto">
            <span className="font-mono-code text-xs text-black/60 tabular-nums">
              {filteredCerts.length} verified{" "}
              {filteredCerts.length === 1 ? "certificate" : "certificates"}
            </span>

            <button
              type="button"
              onClick={() =>
                void handleCopy(
                  "all",
                  formatCollectionCitation(filteredCerts, activeCategory)
                )
              }
              aria-label={`Copy formatted citation for ${filteredCerts.length} ${
                activeCategory === "All" ? "" : `${activeCategory} `
              }certifications`}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold border border-black transition-colors whitespace-nowrap shrink-0 ${
                copiedId === "all"
                  ? "bg-[#dff247] text-black shadow-[3px_3px_0_#000]"
                  : "bg-white text-black hover:bg-[#dff247] shadow-[2px_2px_0_#000]"
              }`}
            >
              {copiedId === "all" ? (
                <>
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Citation Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Copy Citation</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Verified Certificates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCerts.map((cert) => {
            const isCopied = copiedId === cert.id;
            return (
              <article
                key={cert.id}
                className="bg-white border border-black p-5 flex flex-col justify-between hover:shadow-[5px_5px_0_#000] transition-shadow duration-150"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 font-mono-code text-[10px] text-black/65 mb-2.5">
                    <span>{cert.issuer}</span>
                    <span className="tabular-nums">{cert.date}</span>
                  </div>

                  <h3 className="text-base font-extrabold tracking-tight text-black mb-3 leading-snug">
                    {cert.title}
                  </h3>
                </div>

                <div className="pt-3 border-t border-black/10 flex flex-wrap items-center justify-between gap-2.5">
                  <span className="font-mono-code text-[10px] text-black/60 truncate inline-flex items-center gap-1.5 min-w-0">
                    <Award className="w-3.5 h-3.5 text-[#de4ba4] shrink-0" aria-hidden="true" />
                    <span className="truncate">{cert.code}</span>
                  </span>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => void handleCopy(cert.id, formatSingleCitation(cert))}
                      aria-label={`Copy citation for ${cert.title}`}
                      className={`inline-flex items-center gap-1 font-mono-code text-[11px] font-semibold px-2 py-1 border transition-colors whitespace-nowrap ${
                        isCopied
                          ? "bg-[#dff247] border-black text-black"
                          : "bg-[#f4eff2] border-black/25 text-black hover:border-black hover:bg-[#dff247]"
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3 h-3" aria-hidden="true" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" aria-hidden="true" />
                          <span>Copy Citation</span>
                        </>
                      )}
                    </button>

                    <a
                      href={cert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#4d3fab] hover:underline underline-offset-4 whitespace-nowrap shrink-0"
                    >
                      <span>Verify</span>
                      <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
