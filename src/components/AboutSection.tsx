import { useEffect, useState } from "react";
import { ArrowUpRight, Maximize2, X } from "lucide-react";
import { PROFILE } from "../data/kalyanData";

const ABOUT_PORTRAIT_SRC =
  "/assets/aistudio/file_00000000ffb88211ba8776c57fc83f71_2791da84.png";

const ENGINEERING_POSTER_SRC =
  "/assets/aistudio/file_00000000ca28821180ba196dbc5c5f05_960296c9.png";

export default function AboutSection() {
  const [imgFailed, setImgFailed] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);
  const [posterModalOpen, setPosterModalOpen] = useState(false);

  useEffect(() => {
    if (!posterModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPosterModalOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [posterModalOpen]);

  return (
    <section id="about" className="bg-[#f4eff2] py-20 md:py-28 border-b border-black/15">
      <div className="editorial-wrap">
        <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.1fr] gap-12 lg:gap-20 items-start">
          {/* Left Column: Heading + Framed Desk Portrait + Pink Sticky Note */}
          <div>
            <p className="font-mono-code text-[11px] tracking-[0.08em] text-black/75 mb-4">
              A LITTLE ABOUT ME
            </p>
            <h2 className="text-4xl md:text-5xl font-extrabold leading-[1.05] tracking-[-0.045em] text-black mb-10">
              How I got <span className="text-[#5447ba]">here.</span>
            </h2>

            <div className="relative w-full max-w-[330px]">
              <div className="border border-black bg-white p-2 shadow-[6px_6px_0_#000]">
                {!imgFailed ? (
                  <img
                    src={ABOUT_PORTRAIT_SRC}
                    alt="Saragadam Kalyan working on his laptop at his engineering desk"
                    referrerPolicy="no-referrer"
                    onError={() => setImgFailed(true)}
                    className="w-full h-[300px] object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-[300px] bg-zinc-900 text-[#f4eff2] flex items-center justify-center p-6 font-mono-code text-xs">
                    VISAKHAPATNAM · ENGINEERING DESK
                  </div>
                )}
              </div>

              {/* Tilted Pink Note matching reference */}
              <div className="sm:absolute sm:-right-14 sm:top-24 mt-4 sm:mt-0 bg-[#de4ba4] border border-black px-5 py-4 w-44 rotate-3 shadow-[4px_4px_0_#000]">
                <p className="text-base font-bold leading-tight text-black m-0">
                  build practically. share what works.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Story + Metrics + LinkedIn CTA */}
          <div className="lg:pt-6">
            <p className="text-xl md:text-2xl font-semibold leading-[1.4] tracking-[-0.025em] text-black mb-6">
              I&apos;m a Computer Science undergraduate at Vignan&apos;s Institute of Information
              Technology (Class of 2028) who learns by shipping real AI and full-stack software.
            </p>

            <p className="text-[15.5px] leading-[1.7] text-black/80 mb-5">
              Instead of keeping experiments locked inside local notebooks, I turn every concept into
              an inspectable repository or live web tool — from hybrid RAG search pipelines and
              autonomous workflow agents to local small-language-model benchmarks with Ollama and
              production Django utilities on PyPI.
            </p>

            <p className="text-[15.5px] leading-[1.7] text-black/80 mb-8">
              Across GitHub, LinkedIn, Substack, and KalyanHub, I document how AI systems behave in
              practice — focusing on retrieval accuracy, evaluation, and clean full-stack architecture
              that makes models genuinely useful to people.
            </p>

            {/* Metrics Row with Tabular Numerals */}
            <div className="grid grid-cols-3 gap-6 border-t border-black/20 pt-7 pb-8">
              <div>
                <strong className="block font-mono-code text-3xl md:text-4xl font-bold tabular-nums text-black leading-none mb-2">
                  51+
                </strong>
                <span className="text-xs text-black/75 block">Public GitHub repositories</span>
              </div>
              <div>
                <strong className="block font-mono-code text-3xl md:text-4xl font-bold tabular-nums text-black leading-none mb-2">
                  06
                </strong>
                <span className="text-xs text-black/75 block">Core AI &amp; web domains</span>
              </div>
              <div>
                <strong className="block font-mono-code text-3xl md:text-4xl font-bold tabular-nums text-black leading-none mb-2">
                  &apos;28
                </strong>
                <span className="text-xs text-black/75 block">B.Tech CSE cohort</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <a
                href={PROFILE.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-black border-b border-black pb-0.5 hover:text-[#4d3fab] hover:border-[#4d3fab] transition-colors"
              >
                <span>More about my work on LinkedIn</span>
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </a>
              <a
                href={PROFILE.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-black border-b border-black pb-0.5 hover:text-[#4d3fab] hover:border-[#4d3fab] transition-colors"
              >
                <span>Inspect GitHub profile</span>
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        {/* Visual Engineering Snapshot Poster Block */}
        <div className="mt-16 pt-14 border-t border-black/15">
          <div className="bg-white border border-black p-6 md:p-8 shadow-[6px_6px_0_#000] grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-8 lg:gap-12 items-center">
            {/* Poster Frame (Un-cropped full visual) */}
            <div>
              {!posterFailed ? (
                <button
                  type="button"
                  onClick={() => setPosterModalOpen(true)}
                  aria-label="Open full-size engineering snapshot poster"
                  className="group block w-full border border-black bg-[#f4eff2] p-2 text-left hover:shadow-[4px_4px_0_#000] transition-shadow"
                >
                  <img
                    src={ENGINEERING_POSTER_SRC}
                    alt="Kalyan Building, Learning, Growing visual infographic covering programming, DSA, web development, AI and ML, and innovation projects"
                    referrerPolicy="no-referrer"
                    onError={() => setPosterFailed(true)}
                    className="w-full h-auto max-h-[520px] object-contain mx-auto"
                  />
                  <span className="mt-2 px-2 py-1.5 border-t border-black/15 flex items-center justify-between font-mono-code text-[11px] text-black/75 group-hover:text-black">
                    <span>ENGINEERING ROADMAP POSTER</span>
                    <span className="inline-flex items-center gap-1 font-bold text-[#4d3fab]">
                      <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Expand poster</span>
                    </span>
                  </span>
                </button>
              ) : (
                <div className="border border-black bg-[#f4eff2] p-8 text-center font-mono-code text-xs text-black/70">
                  KALYAN · BUILDING · LEARNING · GROWING
                </div>
              )}
            </div>

            {/* Companion Summary of Poster Highlights */}
            <div>
              <p className="font-mono-code text-[11px] font-bold tracking-[0.08em] text-[#de4ba4] mb-3">
                BUILDING · LEARNING · GROWING
              </p>
              <h3
                className="text-2xl md:text-3xl font-extrabold tracking-[-0.035em] text-black mb-4"
                style={{ textWrap: "balance" }}
              >
                Turning ideas into impact —{" "}
                <span className="bg-[#dff247] px-1.5 inline-block">at a glance.</span>
              </h3>
              <p className="text-sm md:text-[15px] leading-[1.7] text-black/80 mb-6">
                A visual map of the stack, problem-solving foundations, and applied AI builds
                guiding my B.Tech CSE journey at Vignan&apos;s Institute of Information Technology
                — pairing strong fundamentals with rapid real-world shipping.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="border border-black/25 bg-[#f4eff2] p-4">
                  <p className="font-mono-code text-[10px] font-bold text-[#4d3fab] mb-1.5">
                    FOUNDATIONS &amp; STACK
                  </p>
                  <p className="text-xs leading-relaxed text-black/80 m-0">
                    Python, Java, C/C++, TypeScript, MERN, MySQL/Oracle, Docker, Linux (Kali),
                    Ollama, DeepSeek, Claude &amp; DSA across CodeChef &amp; HackerEarth.
                  </p>
                </div>

                <div className="border border-black/25 bg-[#f4eff2] p-4">
                  <p className="font-mono-code text-[10px] font-bold text-[#de4ba4] mb-1.5">
                    INNOVATION TRACKS
                  </p>
                  <p className="text-xs leading-relaxed text-black/80 m-0">
                    HealthGuard AI Risk Monitor, Real-Time Environmental Safety Dashboard, AI
                    Fact-Check Platform, Bugsage AI Code Review &amp; NEXORA Railway Planner
                    (SIH26027).
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-black/15">
                <span className="font-mono-code text-xs text-black/70">
                  &ldquo;Same learner... bigger dreams.&rdquo;
                </span>
                <button
                  type="button"
                  onClick={() => setPosterModalOpen(true)}
                  className="inline-flex items-center gap-1.5 bg-black text-[#f4eff2] px-4 py-2.5 text-xs font-bold border border-black hover:bg-[#dff247] hover:text-black transition-colors"
                >
                  <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Inspect Full-Size Poster</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Size Poster Lightbox Modal */}
      {posterModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Kalyan Building Learning Growing Poster"
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 md:p-8"
          onClick={() => setPosterModalOpen(false)}
        >
          <div
            className="bg-white border-2 border-black shadow-[8px_8px_0_#000] max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3 bg-[#f4eff2] border-b border-black flex items-center justify-between gap-4">
              <span className="font-mono-code text-xs font-bold text-black">
                KALYAN · BUILDING · LEARNING · GROWING
              </span>
              <button
                type="button"
                onClick={() => setPosterModalOpen(false)}
                aria-label="Close poster viewer"
                className="w-8 h-8 border border-black bg-white hover:bg-[#dff247] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 bg-zinc-100 overflow-y-auto flex justify-center">
              <img
                src={ENGINEERING_POSTER_SRC}
                alt="Kalyan Building, Learning, Growing full-size engineering infographic"
                className="max-w-full h-auto object-contain border border-black/15"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
