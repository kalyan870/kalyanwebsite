import { Coffee } from "lucide-react";
import { PROFILE } from "../data/kalyanData";

interface FooterProps {
  animationsPaused: boolean;
  onToggleAnimations: () => void;
}

export default function Footer({ animationsPaused, onToggleAnimations }: FooterProps) {
  return (
    <footer className="bg-[#f4eff2] py-8">
      <div className="editorial-wrap flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-black/75">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="font-semibold text-black">© 2026 {PROFILE.name}</span>
          <a
            href={PROFILE.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-black hover:underline underline-offset-4"
          >
            GitHub
          </a>
          <a
            href={PROFILE.links.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-black hover:underline underline-offset-4"
          >
            LinkedIn
          </a>
          <a
            href={PROFILE.links.substack}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-black hover:underline underline-offset-4"
          >
            Substack
          </a>
          <a
            href={PROFILE.links.resumePdf}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-black hover:underline underline-offset-4 font-semibold"
          >
            Resume (PDF)
          </a>
          <a
            href={PROFILE.links.support}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-[#dff247] text-black px-3 py-1 font-bold border border-black hover:bg-[#9084ff] transition-colors"
          >
            <Coffee className="w-3 h-3" aria-hidden="true" />
            <span>Support Me</span>
          </a>
        </div>

        <div className="flex items-center gap-6 font-mono-code text-[11px]">
          <button
            type="button"
            onClick={onToggleAnimations}
            className="hover:text-black underline underline-offset-4"
          >
            {animationsPaused ? "Resume animations" : "Pause animations"}
          </button>
          <a href="#top" className="hover:text-black font-semibold">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
