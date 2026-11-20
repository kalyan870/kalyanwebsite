import { useState } from "react";
import {
  ArrowUpRight,
  Award,
  Briefcase,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  Layers,
  Terminal,
} from "lucide-react";
import { PROFILE, RESUME_DATA } from "../data/kalyanData";

type ResumeViewMode = "structured" | "pdf";

export default function ResumeSection() {
  const [viewMode, setViewMode] = useState<ResumeViewMode>("structured");

  return (
    <section
      id="resume"
      className="bg-white border-b border-black/15 py-20 md:py-28"
    >
      <div className="editorial-wrap">
        {/* Section Header + Direct PDF Controls */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 pb-8 border-b border-black/20">
          <div>
            <p className="font-mono-code text-[11px] tracking-[0.08em] text-black/75 mb-3">
              CURRICULUM VITAE · AI ENGINEER &amp; FULL-STACK DEVELOPER
            </p>
            <h2
              className="text-[clamp(2.2rem,4.5vw,3.9rem)] font-extrabold leading-[1.03] tracking-[-0.045em] text-black"
              style={{ textWrap: "balance" }}
            >
              Interactive <span className="bg-[#dff247] text-black px-2 inline-block">resume.</span>
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div
              role="tablist"
              aria-label="Resume display mode"
              className="inline-flex border border-black bg-[#f4eff2]"
            >
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === "structured"}
                onClick={() => setViewMode("structured")}
                className={`px-4 py-2.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 ${
                  viewMode === "structured"
                    ? "bg-black text-[#f4eff2]"
                    : "bg-transparent text-black hover:bg-[#9084ff]/30"
                }`}
              >
                <Layers className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Structured View</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === "pdf"}
                onClick={() => setViewMode("pdf")}
                className={`px-4 py-2.5 text-xs font-bold border-l border-black transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 ${
                  viewMode === "pdf"
                    ? "bg-black text-[#f4eff2]"
                    : "bg-transparent text-black hover:bg-[#9084ff]/30"
                }`}
              >
                <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                <span>PDF Preview</span>
              </button>
            </div>

            <a
              href={RESUME_DATA.pdfUrl}
              download={RESUME_DATA.fileName}
              className="inline-flex items-center gap-2 bg-[#9084ff] text-black px-5 py-2.5 text-xs font-bold border border-black shadow-[4px_4px_0_#000] hover:bg-[#dff247] transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Download PDF</span>
            </a>

            <a
              href={RESUME_DATA.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-white text-black px-4 py-2.5 text-xs font-bold border border-black hover:bg-black hover:text-[#f4eff2] transition-colors whitespace-nowrap shrink-0"
            >
              <span>Open PDF</span>
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Contact & Credential Strip */}
        <div className="bg-[#f4eff2] border border-black p-5 mb-8 flex flex-wrap items-center justify-between gap-4 font-mono-code text-xs">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-black">
            <span className="font-bold text-sm font-sans">{PROFILE.name}</span>
            <span className="text-black/40" aria-hidden="true">·</span>
            <a
              href={`mailto:${PROFILE.email}`}
              className="hover:text-[#4d3fab] underline underline-offset-4"
            >
              {PROFILE.email}
            </a>
            <span className="text-black/40" aria-hidden="true">·</span>
            <span>{PROFILE.phone}</span>
            <span className="text-black/40" aria-hidden="true">·</span>
            <a
              href={PROFILE.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#4d3fab] underline underline-offset-4"
            >
              github.com/{PROFILE.handle}
            </a>
            <span className="text-black/40" aria-hidden="true">·</span>
            <a
              href={PROFILE.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#4d3fab] underline underline-offset-4"
            >
              linkedin.com/in/saragadamkalyan
            </a>
          </div>

          <span className="font-mono-code text-[11px] font-bold text-[#4d3fab]">
            B.TECH CSE &apos;28 · CGPA 8.5 / 10.0
          </span>
        </div>

        {viewMode === "pdf" ? (
          <div className="border-2 border-black bg-[#101418] shadow-[8px_8px_0_#000]">
            <div className="bg-black text-[#f4eff2] px-5 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-white/15 font-mono-code text-[11px]">
              <span>{RESUME_DATA.fileName}</span>
              <div className="flex items-center gap-4">
                <a
                  href={RESUME_DATA.pdfUrl}
                  download={RESUME_DATA.fileName}
                  className="text-[#dff247] hover:underline inline-flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Save Copy</span>
                </a>
                <a
                  href={RESUME_DATA.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/85 hover:text-white hover:underline inline-flex items-center gap-1"
                >
                  <span>Full Window</span>
                  <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              </div>
            </div>
            <iframe
              src={`${RESUME_DATA.pdfUrl}#view=FitH`}
              title="Saragadam Kalyan AI Engineer Resume PDF"
              className="w-full h-[780px] bg-white"
            />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Summary + Skills Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-6">
              {/* Summary & Education */}
              <div className="space-y-6">
                <article className="bg-[#f4eff2] border border-black p-6 shadow-[5px_5px_0_#000]">
                  <p className="font-mono-code text-[10px] font-bold tracking-[0.08em] text-[#4d3fab] mb-2">
                    SUMMARY
                  </p>
                  <p className="text-sm leading-relaxed text-black/85 m-0">
                    {RESUME_DATA.summary}
                  </p>
                </article>

                <article className="bg-white border border-black p-6 shadow-[5px_5px_0_#000]">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <span className="font-mono-code text-[10px] font-bold tracking-[0.08em] text-black inline-flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-[#de4ba4]" aria-hidden="true" />
                      <span>EDUCATION</span>
                    </span>
                    <span className="font-mono-code text-[11px] text-black/65 tabular-nums">
                      {RESUME_DATA.education.period}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold tracking-tight text-black mb-1">
                    {RESUME_DATA.education.degree}
                  </h3>
                  <p className="text-sm font-semibold text-black/80 mb-2">
                    {RESUME_DATA.education.institution}
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-black/15 font-mono-code text-xs">
                    <span className="font-bold text-[#4d3fab]">
                      {RESUME_DATA.education.cgpa}
                    </span>
                    <span className="text-black/65">{RESUME_DATA.education.location}</span>
                  </div>
                </article>
              </div>

              {/* Technical Skills */}
              <article className="bg-white border border-black p-6 shadow-[5px_5px_0_#000]">
                <p className="font-mono-code text-[10px] font-bold tracking-[0.08em] text-black inline-flex items-center gap-1.5 mb-5">
                  <Terminal className="w-3.5 h-3.5 text-[#9084ff]" aria-hidden="true" />
                  <span>TECHNICAL SKILLS</span>
                </p>

                <div className="space-y-4">
                  {RESUME_DATA.skills.map((group) => (
                    <div key={group.category} className="pb-3.5 border-b border-black/10 last:border-b-0 last:pb-0">
                      <p className="font-mono-code text-[11px] font-bold text-[#4d3fab] mb-1.5">
                        {group.category.toUpperCase()}
                      </p>
                      <p className="text-xs md:text-[13px] leading-relaxed text-black/85 m-0">
                        {group.items.join(" · ")}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            </div>

            {/* Experience */}
            <article className="bg-[#f4eff2] border border-black p-6 md:p-7 shadow-[5px_5px_0_#000]">
              <div className="flex items-center justify-between gap-3 mb-6 pb-3 border-b border-black/15">
                <span className="font-mono-code text-xs font-bold text-black inline-flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#de4ba4]" aria-hidden="true" />
                  <span>EXPERIENCE</span>
                </span>
                <span className="font-mono-code text-[11px] text-black/65">
                  Applied AI &amp; Web Engineering
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {RESUME_DATA.experience.map((exp) => (
                  <div
                    key={`${exp.company}-${exp.role}`}
                    className="bg-white border border-black p-5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 font-mono-code text-[10px] text-black/65 mb-2">
                        <span>{exp.location}</span>
                        <span className="tabular-nums font-bold text-black">{exp.period}</span>
                      </div>
                      <h3 className="text-lg font-extrabold tracking-tight text-black mb-0.5">
                        {exp.role}
                      </h3>
                      <p className="text-xs font-bold text-[#4d3fab] mb-4">
                        {exp.company}
                      </p>
                      <ul className="space-y-2 text-xs md:text-[13px] leading-relaxed text-black/80 m-0 pl-4 list-disc">
                        {exp.bullets.map((bullet) => (
                          <li key={bullet}>{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            {/* Flagship Resume Projects */}
            <article className="bg-white border border-black p-6 md:p-7 shadow-[5px_5px_0_#000]">
              <div className="flex items-center justify-between gap-3 mb-6 pb-3 border-b border-black/15">
                <span className="font-mono-code text-xs font-bold text-black">
                  FLAGSHIP RESUME PROJECTS
                </span>
                <span className="font-mono-code text-[11px] text-black/65">
                  Production Agentic &amp; Voice Systems
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {RESUME_DATA.projects.map((proj) => (
                  <div
                    key={proj.title}
                    className="border border-black bg-[#f4eff2] p-5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 font-mono-code text-[10px] text-black/65 mb-2">
                        <span className="tabular-nums">{proj.period}</span>
                        <a
                          href={proj.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-[#4d3fab] hover:underline inline-flex items-center gap-1"
                        >
                          <span>{proj.repoLabel}</span>
                          <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                        </a>
                      </div>
                      <h3 className="text-xl font-extrabold tracking-tight text-black mb-0.5">
                        {proj.title}
                      </h3>
                      <p className="text-xs font-bold text-black/75 mb-2">
                        {proj.subtitle}
                      </p>
                      <p className="font-mono-code text-[11px] text-black/70 mb-4 pb-3 border-b border-black/15">
                        {proj.stack}
                      </p>
                      <ul className="space-y-2 text-xs md:text-[13px] leading-relaxed text-black/85 m-0 pl-4 list-disc">
                        {proj.bullets.map((bullet) => (
                          <li key={bullet}>{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            {/* Certifications & Achievements Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <article className="bg-[#9084ff] border border-black p-6 shadow-[5px_5px_0_#000]">
                <p className="font-mono-code text-[10px] font-bold tracking-[0.08em] text-black inline-flex items-center gap-1.5 mb-4">
                  <Award className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>KEY CERTIFICATIONS ON RESUME</span>
                </p>
                <div className="space-y-4">
                  {RESUME_DATA.certifications.map((cert) => (
                    <div key={cert.title} className="bg-white border border-black p-4">
                      <div className="flex items-center justify-between gap-2 font-mono-code text-[10px] text-black/65 mb-1">
                        <span>{cert.issuer}</span>
                        <span className="tabular-nums font-bold">{cert.date}</span>
                      </div>
                      <h3 className="text-sm font-extrabold text-black mb-1">
                        {cert.title}
                      </h3>
                      <p className="text-xs leading-relaxed text-black/80 m-0">
                        {cert.description}
                      </p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="bg-[#dff247] border border-black p-6 shadow-[5px_5px_0_#000]">
                <p className="font-mono-code text-[10px] font-bold tracking-[0.08em] text-black mb-4">
                  ACHIEVEMENTS
                </p>
                <ul className="space-y-3 m-0 p-0 list-none">
                  {RESUME_DATA.achievements.map((achievement, idx) => (
                    <li
                      key={achievement}
                      className="bg-white border border-black p-4 flex items-start gap-3"
                    >
                      <span className="font-mono-code text-xs font-bold text-[#4d3fab] shrink-0 mt-0.5 tabular-nums">
                        0{idx + 1}
                      </span>
                      <span className="text-xs md:text-[13px] leading-relaxed text-black/85">
                        {achievement}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
