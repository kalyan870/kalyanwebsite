import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Sparkles } from "lucide-react";
import { VAULT_EXPERIMENTS } from "../data/kalyanData";

export default function LabVaultSection() {
  const [vaultOpen, setVaultOpen] = useState(true);

  return (
    <section id="lab" className="bg-black text-[#f4eff2] border-b border-black py-20 md:py-24">
      <div className="editorial-wrap">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="font-mono-code text-[11px] tracking-[0.08em] text-[#dff247] mb-3">
              A FEW SIDE PROJECTS ESCAPED THE NOTEBOOK
            </p>
            <h2 className="text-[clamp(2.2rem,4.4vw,3.75rem)] font-extrabold leading-[1.03] tracking-[-0.045em] text-[#f4eff2]">
              Kalyan&apos;s vault of live experiments
              <span className="text-[#de4ba4]">.</span>
            </h2>
            <p className="text-sm md:text-base text-[#f4eff2]/75 mt-3 max-w-xl">
              Interactive explainers, local SLM benchmarks, and browser prototypes built to test
              ideas quickly in the wild.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setVaultOpen((prev) => !prev)}
            aria-expanded={vaultOpen}
            className="inline-flex items-center gap-2 bg-[#dff247] text-black px-5 py-3 text-xs font-bold border border-[#dff247] hover:bg-[#9084ff] hover:border-[#9084ff] transition-colors whitespace-nowrap shrink-0 self-start md:self-auto"
          >
            {vaultOpen ? (
              <>
                <span>CLOSE THE VAULT</span>
                <ArrowDownLeft className="w-4 h-4" aria-hidden="true" />
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                <span>UNLOCK THE VAULT</span>
              </>
            )}
          </button>
        </div>

        {vaultOpen && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {VAULT_EXPERIMENTS.map((item) => (
              <a
                key={item.num}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-[#111111] border border-white/20 p-6 flex flex-col justify-between hover:border-[#dff247] hover:bg-[#171717] transition-colors duration-150"
              >
                <div>
                  <p className="font-mono-code text-[10px] tracking-[0.08em] text-[#9084ff] mb-3">
                    {item.num} · {item.tag}
                  </p>
                  <h3 className="text-xl font-extrabold tracking-tight text-[#f4eff2] group-hover:text-[#dff247] mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#f4eff2]/75 mb-6">
                    {item.description}
                  </p>
                </div>

                <span className="inline-flex items-center gap-1.5 font-mono-code text-xs font-semibold text-[#dff247] group-hover:underline underline-offset-4">
                  <span>{item.cta}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                </span>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
