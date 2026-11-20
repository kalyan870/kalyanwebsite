import { useState, type FormEvent } from "react";
import { ArrowUpRight, Check, Coffee, Copy, Mail, Send } from "lucide-react";
import { PROFILE } from "../data/kalyanData";

export default function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedInfo, setSubmittedInfo] = useState<{
    submissionId: string;
    recipient: string;
  } | null>(null);

  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedBio, setCopiedBio] = useState(false);

  const handleCopy = async (text: string, type: "email" | "bio") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "email") {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
      } else {
        setCopiedBio(true);
        setTimeout(() => setCopiedBio(false), 2000);
      }
    } catch {
      // Clipboard blocked in sandbox fallback ignored cleanly
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmittedInfo(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const data = await response.json();
      if (!response.ok) {
        setErrorMsg(data?.error || "Could not send message. Please check your fields.");
      } else {
        setSubmittedInfo({
          submissionId: data.submissionId,
          recipient: data.recipient || PROFILE.email,
        });
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      }
    } catch {
      setErrorMsg("Network error while sending message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const mailtoHref = `mailto:${PROFILE.email}?subject=${encodeURIComponent(
    subject || "Hello Saragadam Kalyan"
  )}&body=${encodeURIComponent(
    `Hi Kalyan,\n\n${message || ""}\n\nBest,\n${name || ""}${email ? ` (${email})` : ""}`
  )}`;

  return (
    <section id="contact" className="bg-[#f4eff2] border-b border-black/15 py-20 md:py-28">
      <div className="editorial-wrap grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16 items-start">
        {/* Left Column: Direct Details & Press/Organizer Actions */}
        <div>
          <p className="font-mono-code text-[11px] tracking-[0.08em] text-black/75 mb-3">
            CONTACT
          </p>
          <h2
            className="text-[clamp(2.3rem,4.6vw,3.9rem)] font-extrabold leading-[1.03] tracking-[-0.045em] text-black mb-5"
            style={{ textWrap: "balance" }}
          >
            Have something in <span className="text-[#de4ba4]">mind?</span>
          </h2>

          <p className="text-[15.5px] leading-[1.68] text-black/80 max-w-md mb-8">
            For AI/ML engineering internships, full-stack collaborations, open-source ideas, or
            technical conversations, send a message using the form or email me directly.
          </p>

          {/* Direct Email Box */}
          <div className="bg-white border border-black p-5 shadow-[4px_4px_0_#000] mb-8">
            <p className="font-mono-code text-[10px] tracking-[0.08em] text-black/65 mb-2">
              LINKEDIN &amp; DIRECT INBOX
            </p>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <a
                href={`mailto:${PROFILE.email}`}
                className="text-base md:text-lg font-bold text-black hover:text-[#4d3fab] underline underline-offset-4 break-all"
              >
                {PROFILE.email}
              </a>
              <button
                type="button"
                onClick={() => handleCopy(PROFILE.email, "email")}
                className="inline-flex items-center gap-1.5 font-mono-code text-xs font-semibold border border-black px-3 py-1.5 bg-[#f4eff2] hover:bg-[#dff247] transition-colors shrink-0"
              >
                {copiedEmail ? (
                  <>
                    <Check className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Copy Email</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Actions matching reference "FOR PRESS & EVENT ORGANIZERS" */}
          <div className="border-t border-black/20 pt-6">
            <p className="font-mono-code text-[10px] tracking-[0.08em] text-black/70 mb-3">
              QUICK LINKS &amp; PROFILE
            </p>
            <div className="flex flex-wrap items-center gap-5 text-sm font-semibold text-black">
              <button
                type="button"
                onClick={() => handleCopy(PROFILE.shortBioCopy, "bio")}
                className="inline-flex items-center gap-1.5 border-b border-black pb-0.5 hover:text-[#4d3fab]"
              >
                <span>{copiedBio ? "Short bio copied" : "Copy short bio"}</span>
              </button>
              <a
                href={PROFILE.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 border-b border-black pb-0.5 hover:text-[#4d3fab]"
              >
                <span>LinkedIn</span>
                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
              <a
                href={PROFILE.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 border-b border-black pb-0.5 hover:text-[#4d3fab]"
              >
                <span>GitHub</span>
                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
              <a
                href={PROFILE.links.substack}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 border-b border-black pb-0.5 hover:text-[#4d3fab]"
              >
                <span>Substack</span>
                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Open-Source Support Me Card */}
          <div className="mt-8 bg-[#dff247] border border-black p-5 shadow-[4px_4px_0_#000] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-mono-code text-[10px] font-bold tracking-[0.08em] text-black/75 mb-1">
                OPEN SOURCE &amp; WRITING
              </p>
              <p className="text-sm font-bold text-black m-0">
                Found a repo, PyPI tool, or guide helpful?
              </p>
            </div>
            <a
              href={PROFILE.links.support}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-black text-[#f4eff2] px-4 py-2.5 text-xs font-bold border border-black hover:bg-[#9084ff] hover:text-black transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
            >
              <Coffee className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Support Me</span>
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Right Column: Working Contact Form */}
        <div className="bg-white border border-black p-6 md:p-8 shadow-[6px_6px_0_#000]">
          <div className="flex items-center justify-between gap-4 border-b border-black/15 pb-4 mb-6">
            <div>
              <h3 className="text-xl font-extrabold tracking-tight text-black">
                Send a message
              </h3>
              <p className="font-mono-code text-[11px] text-black/65 mt-0.5">
                Delivered to {PROFILE.email}
              </p>
            </div>
            <Mail className="w-5 h-5 text-[#9084ff]" aria-hidden="true" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="contact-name"
                  className="block font-mono-code text-[11px] font-semibold text-black mb-1.5"
                >
                  NAME
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full border border-black bg-[#f4eff2] px-3.5 py-2.5 text-sm text-black placeholder:text-black/45 focus:bg-white focus:outline-3 focus:outline-[#de4ba4] focus:outline-offset-0"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-email"
                  className="block font-mono-code text-[11px] font-semibold text-black mb-1.5"
                >
                  EMAIL
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border border-black bg-[#f4eff2] px-3.5 py-2.5 text-sm text-black placeholder:text-black/45 focus:bg-white focus:outline-3 focus:outline-[#de4ba4] focus:outline-offset-0"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="contact-subject"
                className="block font-mono-code text-[11px] font-semibold text-black mb-1.5"
              >
                SUBJECT
              </label>
              <input
                id="contact-subject"
                name="subject"
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Internship, project collaboration, or inquiry"
                className="w-full border border-black bg-[#f4eff2] px-3.5 py-2.5 text-sm text-black placeholder:text-black/45 focus:bg-white focus:outline-3 focus:outline-[#de4ba4] focus:outline-offset-0"
              />
            </div>

            <div>
              <label
                htmlFor="contact-message"
                className="block font-mono-code text-[11px] font-semibold text-black mb-1.5"
              >
                MESSAGE
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={5}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share a bit about your project, team, or what you'd like to discuss..."
                className="w-full border border-black bg-[#f4eff2] px-3.5 py-2.5 text-sm text-black placeholder:text-black/45 focus:bg-white focus:outline-3 focus:outline-[#de4ba4] focus:outline-offset-0 resize-y"
              />
            </div>

            {errorMsg && (
              <div
                role="alert"
                className="border border-black bg-[#de4ba4]/20 px-4 py-3 text-xs font-semibold text-black"
              >
                {errorMsg}
              </div>
            )}

            {submittedInfo && (
              <div
                role="status"
                className="border border-black bg-[#dff247] px-4 py-3 text-xs font-semibold text-black"
              >
                Message sent to {submittedInfo.recipient} (Ref: {submittedInfo.submissionId}).
                Thank you for reaching out!
              </div>
            )}

            <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 bg-black text-[#f4eff2] px-6 py-3 text-xs font-bold border border-black hover:bg-[#dff247] hover:text-black transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{submitting ? "Sending..." : "Send Message"}</span>
              </button>

              <a
                href={mailtoHref}
                className="inline-flex items-center gap-1 font-mono-code text-[11px] font-semibold text-black/75 hover:text-black underline underline-offset-4"
              >
                <span>Or open in your email app</span>
                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
