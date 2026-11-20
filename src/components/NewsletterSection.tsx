import { useState, type FormEvent } from "react";
import { ArrowUpRight, CheckCircle2, MailPlus } from "lucide-react";
import { PROFILE } from "../data/kalyanData";

const TOPICS = ["All Updates", "Substack Essays", "New AI Projects"] as const;

export default function NewsletterSection() {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState<(typeof TOPICS)[number]>("All Updates");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedEmail, setConfirmedEmail] = useState<string | null>(null);
  const [alreadyJoined, setAlreadyJoined] = useState(false);

  const handleSubscribe = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setConfirmedEmail(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName, interest }),
      });

      const data = await response.json();
      if (!response.ok) {
        setErrorMsg(data?.error || "Could not complete signup. Please check your email.");
      } else {
        setConfirmedEmail(data.email || email);
        setAlreadyJoined(Boolean(data.alreadySubscribed));
        setEmail("");
        setFirstName("");
      }
    } catch {
      setErrorMsg("Network error while subscribing. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="newsletter"
      aria-labelledby="newsletter-heading"
      className="bg-[#9084ff] border-b border-black py-16 md:py-24"
    >
      <div className="editorial-wrap grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-10 lg:gap-14 items-center">
        {/* Left Editorial Copy */}
        <div>
          <p className="font-mono-code text-[11px] tracking-[0.08em] text-black/85 mb-3">
            NEWSLETTER · DISPATCHES ON AI &amp; FULL-STACK
          </p>
          <h2
            id="newsletter-heading"
            className="text-[clamp(2rem,4vw,3.4rem)] font-extrabold leading-[1.04] tracking-[-0.045em] text-black mb-4"
            style={{ textWrap: "balance" }}
          >
            Get notes on new <span className="bg-[#dff247] px-2 inline-block">builds &amp; essays.</span>
          </h2>
          <p className="text-[15.5px] leading-[1.65] text-black/85 max-w-lg mb-6">
            Occasional updates when I ship a new open-source AI system, publish a deep dive on RAG
            and local SLMs, or release a new Substack issue. Zero spam—unsubscribe anytime.
          </p>

          <a
            href={`${PROFILE.links.substack}subscribe`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-black border-b border-black pb-0.5 hover:text-white hover:border-white transition-colors"
          >
            <span>Prefer Substack directly? Subscribe here</span>
            <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
          </a>
        </div>

        {/* Right Signup Card */}
        <div className="bg-[#f4eff2] border border-black p-6 md:p-8 shadow-[6px_6px_0_#000]">
          <div className="flex items-center justify-between gap-3 border-b border-black/15 pb-4 mb-5">
            <div>
              <h3 className="text-xl font-extrabold tracking-tight text-black">
                Join the mailing list
              </h3>
              <p className="font-mono-code text-[11px] text-black/65 mt-0.5">
                Writing · GitHub releases · Architecture notes
              </p>
            </div>
            <MailPlus className="w-5 h-5 text-[#de4ba4] shrink-0" aria-hidden="true" />
          </div>

          <form onSubmit={handleSubscribe} className="space-y-4" noValidate>
            {/* Topic Selection */}
            <div>
              <span className="block font-mono-code text-[11px] font-semibold text-black mb-2">
                WHAT WOULD YOU LIKE TO RECEIVE?
              </span>
              <div
                role="radiogroup"
                aria-label="Newsletter topic preference"
                className="flex flex-wrap gap-2"
              >
                {TOPICS.map((topic) => {
                  const selected = interest === topic;
                  return (
                    <button
                      key={topic}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setInterest(topic)}
                      className={`px-3.5 py-2 text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 ${
                        selected
                          ? "bg-black text-[#f4eff2] border-black"
                          : "bg-white text-black border-black/30 hover:border-black"
                      }`}
                    >
                      {topic}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label
                  htmlFor="newsletter-name"
                  className="block font-mono-code text-[11px] font-semibold text-black mb-1.5"
                >
                  FIRST NAME (OPTIONAL)
                </label>
                <input
                  id="newsletter-name"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Alex"
                  className="w-full border border-black bg-white px-3.5 py-2.5 text-sm text-black placeholder:text-black/45 focus:outline-3 focus:outline-[#de4ba4] focus:outline-offset-0"
                />
              </div>

              <div>
                <label
                  htmlFor="newsletter-email"
                  className="block font-mono-code text-[11px] font-semibold text-black mb-1.5"
                >
                  EMAIL ADDRESS
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border border-black bg-white px-3.5 py-2.5 text-sm text-black placeholder:text-black/45 focus:outline-3 focus:outline-[#de4ba4] focus:outline-offset-0"
                />
              </div>
            </div>

            {errorMsg && (
              <div
                role="alert"
                className="border border-black bg-[#de4ba4]/25 px-4 py-3 text-xs font-semibold text-black"
              >
                {errorMsg}
              </div>
            )}

            {confirmedEmail && (
              <div
                role="status"
                className="border border-black bg-[#dff247] px-4 py-3 text-xs font-semibold text-black flex items-start gap-2"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  {alreadyJoined
                    ? `${confirmedEmail} is already subscribed—you're all set for the next dispatch.`
                    : `Subscribed ${confirmedEmail} for ${interest}. Thanks for joining!`}
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-black text-[#f4eff2] px-6 py-3 text-xs font-bold border border-black hover:bg-[#dff247] hover:text-black transition-colors disabled:opacity-50"
            >
              <span>{submitting ? "Subscribing..." : "Subscribe to Updates"}</span>
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
