import { ArrowUpRight, Award } from "lucide-react";
import {
  FEATURED_ECOSYSTEMS,
  PROFILE,
  RECOGNITION_HIGHLIGHTS,
} from "../data/kalyanData";

export default function FeaturedSection() {
  return (
    <section
      id="featured"
      aria-labelledby="featured-heading"
      className="bg-[#f4eff2] border-b border-black/15 py-20 md:py-28"
    >
      <div className="editorial-wrap">
        {/* Heading Row */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <p className="font-mono-code text-[11px] tracking-[0.08em] text-black/75 mb-3">
              FEATURED IN &amp; RECOGNITION
            </p>
            <h2
              id="featured-heading"
              className="text-[clamp(2.2rem,4.5vw,3.9rem)] font-extrabold leading-[1.03] tracking-[-0.045em] text-black"
              style={{ textWrap: "balance" }}
            >
              Platforms, cohorts &amp;{" "}
              <span className="text-[#5447ba]">recognition.</span>
            </h2>
          </div>

          <p className="text-sm text-black/75 max-w-sm leading-relaxed">
            Verified open-source releases, industry internship deliverables, and technical
            programs across AI engineering and web ecosystems.
          </p>
        </div>

        {/* Typographic Ecosystem Strip (Modeled after Reference Companies Band) */}
        <div className="bg-white border border-black p-6 md:p-8 shadow-[5px_5px_0_#000] mb-12">
          <p className="font-mono-code text-[10px] tracking-[0.09em] text-black/60 mb-4">
            SHIPPED, CERTIFIED &amp; ACTIVE ON
          </p>
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-3">
            {FEATURED_ECOSYSTEMS.map((name, idx) => (
              <span
                key={name}
                className="text-lg md:text-2xl font-extrabold tracking-tight text-black inline-flex items-baseline gap-6"
              >
                <span>{name}</span>
                {idx < FEATURED_ECOSYSTEMS.length - 1 && (
                  <span className="text-[#de4ba4] text-base" aria-hidden="true">
                    ✳
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* 4 Verifiable Recognition & Community Milestone Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {RECOGNITION_HIGHLIGHTS.map((item) => (
            <article
              key={item.id}
              className="bg-white border border-black p-6 md:p-7 flex flex-col justify-between hover:shadow-[5px_5px_0_#000] transition-shadow duration-150"
            >
              <div>
                <div className="flex items-center justify-between gap-3 font-mono-code text-[10px] mb-3">
                  <span className="font-bold text-[#de4ba4]">{item.tag}</span>
                  <span className="text-black/65">{item.organization}</span>
                </div>

                <h3 className="text-xl md:text-2xl font-extrabold tracking-tight text-black mb-3">
                  {item.title}
                </h3>

                <p className="text-sm leading-[1.65] text-black/80 mb-5">{item.summary}</p>
              </div>

              <div className="pt-4 border-t border-black/15 flex items-center justify-between gap-4">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4d3fab] hover:underline underline-offset-4"
                >
                  <span>{item.linkLabel}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              </div>
            </article>
          ))}
        </div>

        {/* Network Endorsement Invitation Bar */}
        <div className="bg-[#dff247] border border-black p-6 md:p-7 shadow-[5px_5px_0_#000] flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start gap-3.5">
            <Award className="w-5 h-5 text-black shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h3 className="text-lg font-extrabold tracking-tight text-black mb-1">
                Collaborated on a repository or internship project?
              </h3>
              <p className="text-sm text-black/80 m-0">
                View featured milestones and recommendations on LinkedIn, or share a note directly.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 shrink-0">
            <a
              href={PROFILE.links.linkedinFeatured}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-black text-[#f4eff2] px-4 py-2.5 text-xs font-bold border border-black hover:bg-[#9084ff] hover:text-black transition-colors whitespace-nowrap"
            >
              <span>LinkedIn Featured</span>
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-1 text-xs font-bold text-black border-b border-black pb-0.5 hover:text-[#4d3fab] whitespace-nowrap"
            >
              <span>Send an endorsement</span>
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
