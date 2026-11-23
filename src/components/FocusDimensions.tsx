import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import systemsArtwork from "../assets/images/spotlight_ai_architecture_1794758505084.webp";
import { FOCUS_DIMENSIONS, PROFILE } from "../data/kalyanData";

export default function FocusDimensions() {
  const [activeId, setActiveId] = useState(FOCUS_DIMENSIONS[0].id);
  const [artFailed, setArtFailed] = useState(false);

  const activeItem =
    FOCUS_DIMENSIONS.find((item) => item.id === activeId) ?? FOCUS_DIMENSIONS[0];

  return (
    <section id="focus" className="violet-scanline border-b border-black py-20 md:py-28">
      <div className="editorial-wrap">
        {/* Section Heading Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="font-mono-code text-[11px] tracking-[0.08em] text-black/85 mb-3">
              A STUDY IN ENGINEERING
            </p>
            <h2 className="text-[clamp(2.4rem,4.7vw,4rem)] font-extrabold leading-[1.02] tracking-[-0.045em] text-black">
              The things I <span className="text-[#dff247]">build</span>.
            </h2>
          </div>
          <p className="font-mono-code text-xs text-black/85 md:text-right">
            Six core focus areas.
            <br />
            Select a window to inspect.
          </p>
        </div>

        {/* Interactive 3-Column Editorial Map */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_260px] gap-6 items-stretch">
          {/* Left 3 Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:flex lg:flex-col gap-3">
            {FOCUS_DIMENSIONS.slice(0, 3).map((dim) => {
              const isSelected = dim.id === activeId;
              return (
                <button
                  key={dim.id}
                  type="button"
                  onClick={() => setActiveId(dim.id)}
                  onMouseEnter={() => setActiveId(dim.id)}
                  className={`text-left p-4 border border-black transition-all duration-150 ${
                    isSelected
                      ? "bg-[#dff247] shadow-[4px_4px_0_#000] -translate-y-0.5"
                      : "bg-[#f4eff2] hover:bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono-code text-xs font-bold tabular-nums text-black">
                      {dim.number}
                    </span>
                    <span className="font-mono-code text-[10px] text-black/65">
                      {dim.accentLabel}
                    </span>
                  </div>
                  <span className="block text-lg font-extrabold tracking-tight text-black">
                    {dim.shortLabel}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Center Interactive Spotlight Card */}
          <div className="relative bg-[#f4eff2] border border-black p-6 md:p-8 shadow-[6px_6px_0_#000] flex flex-col justify-between overflow-hidden">
            {/* Subtle rotating orbit accent behind corner */}
            <div
              aria-hidden="true"
              className="orbit-ring pointer-events-none absolute -right-24 -top-24 w-64 h-64 rounded-full border border-dashed border-black/20"
            />

            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <span className="font-mono-code text-[11px] font-semibold tracking-[0.06em] text-[#4d3fab]">
                  {activeItem.kicker}
                </span>
                <span className="font-mono-code text-[11px] text-black/65">
                  FIG. {activeItem.number} / SYSTEM FOCUS
                </span>
              </div>

              <h3 className="text-2xl md:text-3xl font-extrabold tracking-[-0.035em] text-black mb-4">
                {activeItem.title}
              </h3>

              <p className="text-[15px] leading-[1.65] text-black/80 mb-6">
                {activeItem.description}
              </p>

              {/* Editorial Artwork Preview */}
              <div className="border border-black bg-white mb-6 overflow-hidden">
                {!artFailed ? (
                  <img
                    src={systemsArtwork}
                    alt="Modular AI agent architecture and vector grid illustration"
                    referrerPolicy="no-referrer"
                    onError={() => setArtFailed(true)}
                    className="w-full h-44 md:h-52 object-cover"
                  />
                ) : (
                  <div className="w-full h-44 md:h-52 bg-black text-[#dff247] flex items-center justify-center font-mono-code text-xs">
                    MODULAR AI ARCHITECTURE · KALYAN870
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-black/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2 font-mono-code text-xs text-black/75">
                {activeItem.highlights.map((h, i) => (
                  <span key={h} className="inline-flex items-center gap-2">
                    {i > 0 && <span aria-hidden="true">·</span>}
                    <span>{h}</span>
                  </span>
                ))}
              </div>

              <a
                href={activeItem.ctaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-black text-[#f4eff2] px-4 py-2.5 text-xs font-semibold hover:bg-[#de4ba4] hover:text-black border border-black transition-colors whitespace-nowrap shrink-0"
              >
                <span>{activeItem.ctaLabel}</span>
                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Right 3 Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:flex lg:flex-col gap-3">
            {FOCUS_DIMENSIONS.slice(3, 6).map((dim) => {
              const isSelected = dim.id === activeId;
              return (
                <button
                  key={dim.id}
                  type="button"
                  onClick={() => setActiveId(dim.id)}
                  onMouseEnter={() => setActiveId(dim.id)}
                  className={`text-left p-4 border border-black transition-all duration-150 ${
                    isSelected
                      ? "bg-[#dff247] shadow-[4px_4px_0_#000] -translate-y-0.5"
                      : "bg-[#f4eff2] hover:bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono-code text-xs font-bold tabular-nums text-black">
                      {dim.number}
                    </span>
                    <span className="font-mono-code text-[10px] text-black/65">
                      {dim.accentLabel}
                    </span>
                  </div>
                  <span className="block text-lg font-extrabold tracking-tight text-black">
                    {dim.shortLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Social strip at bottom of Violet section */}
        <div className="mt-10 pt-6 border-t border-black/25 flex flex-wrap items-center justify-between gap-4">
          <span className="font-mono-code text-xs font-semibold text-black">
            Elsewhere on the internet.
          </span>
          <div className="flex flex-wrap items-center gap-6 text-sm font-semibold text-black">
            <a
              href={PROFILE.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:underline underline-offset-4"
            >
              <span>GitHub</span>
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
              href={PROFILE.links.substack}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:underline underline-offset-4"
            >
              <span>Substack</span>
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
            <a
              href={PROFILE.links.kalyanhub}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:underline underline-offset-4"
            >
              <span>KalyanHub</span>
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
