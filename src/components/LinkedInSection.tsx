import { useEffect, useState } from "react";
import { ArrowUpRight, Briefcase, RefreshCw } from "lucide-react";
import {
  LINKEDIN_EXPERIENCE,
  LINKEDIN_POSTS,
  PROFILE,
  type LinkedInPostItem,
} from "../data/kalyanData";

interface LiveActivityItem {
  id: string;
  kind: string;
  title: string;
  repo: string;
  date: string;
  url: string;
}

export default function LinkedInSection() {
  const [liveActivity, setLiveActivity] = useState<LiveActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<LinkedInPostItem | null>(null);

  const fetchActivity = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/linkedin-activity");
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data?.liveActivity)) {
          setLiveActivity(data.liveActivity);
        }
      }
    } catch {
      // Non-fatal fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, []);

  return (
    <section id="linkedin" className="bg-[#f4eff2] border-b border-black/15 py-20 md:py-28">
      <div className="editorial-wrap">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <p className="font-mono-code text-[11px] tracking-[0.08em] text-black/75 mb-3">
              LINKEDIN ACTIVITY &amp; EXPERIENCE · IN/SARAGADAMKALYAN
            </p>
            <h2
              className="text-[clamp(2.2rem,4.5vw,3.9rem)] font-extrabold leading-[1.03] tracking-[-0.045em] text-black"
              style={{ textWrap: "balance" }}
            >
              Building in public on <span className="text-[#4d3fab]">LinkedIn.</span>
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={fetchActivity}
              disabled={loading}
              className="inline-flex items-center gap-1.5 font-mono-code text-xs font-semibold text-black border border-black/30 bg-white px-3.5 py-2 hover:border-black transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
              <span>{loading ? "Syncing..." : "Refresh Activity"}</span>
            </button>

            <a
              href={PROFILE.links.linkedinActivity}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-black text-[#f4eff2] px-4 py-2.5 text-xs font-bold border border-black hover:bg-[#dff247] hover:text-black transition-colors whitespace-nowrap"
            >
              <span>View LinkedIn Activity</span>
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* 2-Column Editorial Grid: LinkedIn Posts + Experience / Live Engineering Pulse */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 items-start">
          {/* Left: Curated LinkedIn Posts */}
          <div>
            <div className="flex items-center justify-between border-b border-black/20 pb-3 mb-5">
              <span className="font-mono-code text-xs font-bold text-black">
                RECENT LINKEDIN POSTS &amp; MILESTONES
              </span>
              <a
                href={PROFILE.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono-code text-[11px] font-semibold text-[#4d3fab] hover:underline underline-offset-4"
              >
                linkedin.com/in/saragadamkalyan ↗
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {LINKEDIN_POSTS.map((post) => {
                const isExpanded = selectedPost?.id === post.id;
                return (
                  <article
                    key={post.id}
                    className="bg-white border border-black p-5 flex flex-col justify-between shadow-[4px_4px_0_#000]"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 font-mono-code text-[10px] text-black/65 mb-2.5">
                        <span className="text-[#de4ba4] font-bold">{post.type}</span>
                        <span>
                          {post.date} · {post.readTime}
                        </span>
                      </div>

                      <h3 className="text-lg font-extrabold tracking-tight text-black mb-2.5">
                        {post.title}
                      </h3>

                      <p
                        className={`text-sm leading-relaxed text-black/80 mb-4 ${
                          isExpanded ? "" : "line-clamp-3"
                        }`}
                      >
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-black/10 flex items-center justify-between gap-3">
                      <span className="font-mono-code text-[10px] text-black/60 truncate">
                        {post.tags.join(" · ")}
                      </span>

                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          type="button"
                          onClick={() => setSelectedPost(isExpanded ? null : post)}
                          className="font-mono-code text-[11px] font-semibold text-black hover:underline underline-offset-4"
                        >
                          {isExpanded ? "Collapse" : "Read"}
                        </button>
                        <a
                          href={post.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#4d3fab] hover:underline underline-offset-4"
                        >
                          <span>LinkedIn</span>
                          <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {/* Right: Experience & Live Ship Log */}
          <div className="flex flex-col gap-6">
            {/* Internships & Experience */}
            <div className="bg-white border border-black p-6 shadow-[5px_5px_0_#000]">
              <div className="flex items-center justify-between gap-2 border-b border-black/15 pb-3 mb-4">
                <span className="font-mono-code text-xs font-bold text-black inline-flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-[#9084ff]" aria-hidden="true" />
                  EXPERIENCE &amp; INTERNSHIPS
                </span>
                <a
                  href={PROFILE.links.linkedinFeatured}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono-code text-[10px] font-semibold text-[#4d3fab] hover:underline underline-offset-4"
                >
                  Featured ↗
                </a>
              </div>

              <div className="divide-y divide-black/15">
                {LINKEDIN_EXPERIENCE.map((exp) => (
                  <div key={`${exp.company}-${exp.role}`} className="py-3.5 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                      <h3 className="text-base font-extrabold tracking-tight text-black">
                        {exp.role}
                      </h3>
                      <span className="font-mono-code text-[11px] text-black/65 tabular-nums">
                        {exp.period}
                      </span>
                    </div>
                    <p className="font-mono-code text-[11px] text-[#4d3fab] font-semibold mb-1.5">
                      {exp.company} · {exp.type}
                    </p>
                    <p className="text-xs leading-relaxed text-black/80 m-0">{exp.desc}</p>
                    {exp.repoUrl && (
                      <a
                        href={exp.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-2 font-mono-code text-[11px] font-semibold text-black hover:text-[#de4ba4] underline underline-offset-4"
                      >
                        <span>Inspect Internship Repo</span>
                        <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Live Engineering Pulse */}
            <div className="bg-black text-[#f4eff2] border border-black p-6">
              <div className="flex items-center justify-between gap-2 border-b border-white/20 pb-3 mb-4">
                <span className="font-mono-code text-[11px] font-bold text-[#dff247]">
                  LIVE REPOSITORY &amp; BUILD PULSE
                </span>
                <span className="font-mono-code text-[10px] text-white/60">
                  {loading ? "Syncing..." : `${liveActivity.length} recent events`}
                </span>
              </div>

              {liveActivity.length > 0 ? (
                <ul className="space-y-3">
                  {liveActivity.map((ev) => (
                    <li key={ev.id} className="border-b border-white/10 pb-2.5 last:border-b-0 last:pb-0">
                      <a
                        href={ev.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block"
                      >
                        <div className="flex items-center justify-between gap-2 font-mono-code text-[10px] text-[#9084ff] mb-0.5">
                          <span>
                            {ev.kind} · {ev.repo}
                          </span>
                          <span className="text-white/55 tabular-nums">{ev.date}</span>
                        </div>
                        <p className="text-xs font-semibold text-[#f4eff2] group-hover:text-[#dff247] truncate m-0">
                          {ev.title}
                        </p>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-white/75 m-0">
                  Follow{" "}
                  <a
                    href={PROFILE.links.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-[#dff247]"
                  >
                    LinkedIn
                  </a>{" "}
                  and{" "}
                  <a
                    href={PROFILE.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-[#dff247]"
                  >
                    GitHub
                  </a>{" "}
                  for real-time build updates.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
