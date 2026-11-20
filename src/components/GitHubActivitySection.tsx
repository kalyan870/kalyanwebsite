import { useEffect, useState } from "react";
import { ArrowUpRight, RefreshCw } from "lucide-react";
import { PROFILE } from "../data/kalyanData";

interface ContributionDay {
  date: string;
  level: 0 | 1 | 2 | 3 | 4;
  count: number;
}

interface ContributionResponse {
  username: string;
  totalContributions: number;
  activeDays: number;
  longestStreak: number;
  currentStreak: number;
  bestDay: { date: string; count: number } | null;
  days: ContributionDay[];
  fetchedAt: string;
  error?: string;
}

function formatHumanDate(isoDate: string): string {
  const parsed = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function GitHubActivitySection() {
  const [data, setData] = useState<ContributionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadContributions = async (forceRefresh = false) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const url = forceRefresh
        ? "/api/github-contributions?refresh=1"
        : "/api/github-contributions";
      const response = await fetch(url);
      const payload = (await response.json()) as ContributionResponse;

      if (!response.ok || !Array.isArray(payload.days) || payload.days.length === 0) {
        setErrorMsg(payload.error || "Unable to fetch live GitHub contributions right now.");
      } else {
        setData(payload);
      }
    } catch {
      setErrorMsg("Unable to fetch live GitHub contributions right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContributions(false);
  }, []);

  return (
    <section
      id="coding-activity"
      aria-labelledby="coding-activity-heading"
      className="bg-[#f4eff2] border-b border-black/15 py-20 md:py-24"
    >
      <div className="editorial-wrap">
        {/* Heading Row */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <p className="font-mono-code text-[11px] tracking-[0.08em] text-black/75 mb-3">
              GITHUB CODING ACTIVITY · @KALYAN870
            </p>
            <h2
              id="coding-activity-heading"
              className="text-[clamp(2.1rem,4.3vw,3.6rem)] font-extrabold leading-[1.03] tracking-[-0.045em] text-black"
              style={{ textWrap: "balance" }}
            >
              Consistent daily <span className="bg-[#dff247] px-2 inline-block">commits.</span>
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => loadContributions(true)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 font-mono-code text-xs font-semibold text-black border border-black/30 bg-white px-3.5 py-2 hover:border-black transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
              <span>{loading ? "Loading..." : "Refresh Stats"}</span>
            </button>

            <a
              href={PROFILE.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-black border-b border-black pb-0.5 hover:text-[#4d3fab] hover:border-[#4d3fab] whitespace-nowrap"
            >
              <span>Inspect on GitHub</span>
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Summary KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-black p-5 shadow-[4px_4px_0_#000]">
            <span className="block font-mono-code text-[10px] tracking-[0.08em] text-black/65 mb-2">
              LAST 12 MONTHS
            </span>
            <strong className="block font-mono-code text-3xl md:text-4xl font-bold tabular-nums text-black leading-none">
              {loading && !data ? "—" : (data?.totalContributions ?? 0).toLocaleString()}
            </strong>
            <span className="text-xs text-black/70 mt-1.5 block">Total contributions</span>
          </div>

          <div className="bg-white border border-black p-5 shadow-[4px_4px_0_#000]">
            <span className="block font-mono-code text-[10px] tracking-[0.08em] text-black/65 mb-2">
              CONSISTENCY
            </span>
            <strong className="block font-mono-code text-3xl md:text-4xl font-bold tabular-nums text-black leading-none">
              {loading && !data ? "—" : data?.activeDays ?? 0}
            </strong>
            <span className="text-xs text-black/70 mt-1.5 block">Active coding days</span>
          </div>

          <div className="bg-white border border-black p-5 shadow-[4px_4px_0_#000]">
            <span className="block font-mono-code text-[10px] tracking-[0.08em] text-black/65 mb-2">
              LONGEST STREAK
            </span>
            <strong className="block font-mono-code text-3xl md:text-4xl font-bold tabular-nums text-black leading-none">
              {loading && !data ? "—" : `${data?.longestStreak ?? 0}d`}
            </strong>
            <span className="text-xs text-black/70 mt-1.5 block">Consecutive active days</span>
          </div>

          <div className="bg-white border border-black p-5 shadow-[4px_4px_0_#000]">
            <span className="block font-mono-code text-[10px] tracking-[0.08em] text-black/65 mb-2">
              PEAK DAY
            </span>
            <strong className="block font-mono-code text-3xl md:text-4xl font-bold tabular-nums text-[#de4ba4] leading-none">
              {loading && !data ? "—" : data?.bestDay?.count ?? 0}
            </strong>
            <span className="text-xs text-black/70 mt-1.5 block">
              {data?.bestDay ? formatHumanDate(data.bestDay.date) : "Highest single-day output"}
            </span>
          </div>
        </div>

        {errorMsg && !data && (
          <p className="mt-4 font-mono-code text-xs text-black/70">{errorMsg}</p>
        )}
      </div>
    </section>
  );
}
