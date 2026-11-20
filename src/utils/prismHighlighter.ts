import Prism from "prismjs";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-css";
import "prismjs/components/prism-docker";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-json";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-python";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-yaml";

const LANG_ALIASES: Record<string, string> = {
  py: "python",
  python3: "python",
  js: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  ts: "typescript",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  console: "bash",
  yml: "yaml",
  dockerfile: "docker",
  html: "markup",
  xml: "markup",
  md: "markdown",
};

function inferLanguage(codeText: string): string {
  const sample = codeText.trim();
  if (!sample) return "javascript";

  if (/^(FROM|RUN|CMD|WORKDIR|COPY|ENTRYPOINT)\s+/m.test(sample)) return "docker";
  if (/^(def |async def |class [A-Z]\w*[:(]|from [\w.]+ import |import [\w.]+|@\w+)/m.test(sample)) {
    return "python";
  }
  if (/^\s*(\$|pip |uv |python |npm |npx |pnpm |yarn |docker |git |curl )/m.test(sample)) {
    return "bash";
  }
  if (/^\s*[\[{]/.test(sample) && /"\w+"\s*:/.test(sample)) {
    return "json";
  }
  if (/\b(SELECT|INSERT INTO|CREATE TABLE|ALTER TABLE|WHERE|GROUP BY)\b/i.test(sample)) {
    return "sql";
  }
  if (/\b(interface |type \w+\s*=|:\s*(string|number|boolean|Record<|Promise<))/m.test(sample)) {
    return sample.includes("</") || sample.includes("/>") ? "tsx" : "typescript";
  }
  if (/<\/[a-zA-Z]+>/.test(sample) && /\b(return|const|function)\b/.test(sample)) {
    return "jsx";
  }
  if (/^[\w-]+:\s+.+/m.test(sample) && !sample.includes(";")) {
    return "yaml";
  }

  return "javascript";
}

function resolveLanguage(codeEl: HTMLElement, preEl: HTMLElement): string {
  const candidates = [
    codeEl.className,
    preEl.className,
    preEl.getAttribute("data-language") ?? "",
    codeEl.getAttribute("data-language") ?? "",
  ].join(" ");

  const match = candidates.match(/language-([a-zA-Z0-9_-]+)|lang-([a-zA-Z0-9_-]+)/);
  const raw = (match?.[1] || match?.[2] || "").toLowerCase();
  const normalized = LANG_ALIASES[raw] || raw;

  if (normalized && Prism.languages[normalized]) {
    return normalized;
  }

  const inferred = inferLanguage(codeEl.textContent || "");
  return Prism.languages[inferred] ? inferred : "javascript";
}

/**
 * Enhances all <pre> code blocks inside a rendered Substack article container
 * with Prism.js syntax highlighting, language labels, and one-click copy controls.
 */
export function highlightArticleCodeBlocks(container: HTMLElement): void {
  const preElements = Array.from(container.querySelectorAll("pre"));

  for (const preEl of preElements) {
    // Ensure a nested <code> element exists for Prism highlighting
    let codeEl = preEl.querySelector("code");
    if (!codeEl) {
      codeEl = document.createElement("code");
      codeEl.textContent = preEl.textContent || "";
      preEl.textContent = "";
      preEl.appendChild(codeEl);
    }

    const lang = resolveLanguage(codeEl, preEl);
    codeEl.className = `language-${lang}`;
    preEl.classList.add(`language-${lang}`);

    Prism.highlightElement(codeEl);

    // Wrap <pre> once in a crisp editorial header frame with language + Copy button
    const parent = preEl.parentElement;
    if (parent && parent.classList.contains("substack-code-shell")) {
      continue;
    }

    const shell = document.createElement("div");
    shell.className = "substack-code-shell";

    const toolbar = document.createElement("div");
    toolbar.className = "substack-code-toolbar";

    const langLabel = document.createElement("span");
    langLabel.className = "substack-code-lang";
    langLabel.textContent = lang.toUpperCase();

    const copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.className = "substack-code-copy";
    copyBtn.textContent = "Copy code";
    copyBtn.setAttribute("aria-label", `Copy ${lang} code snippet`);

    const rawCode = codeEl.textContent || "";
    copyBtn.addEventListener("click", () => {
      navigator.clipboard?.writeText(rawCode).then(
        () => {
          copyBtn.textContent = "Copied";
          copyBtn.classList.add("is-copied");
          window.setTimeout(() => {
            copyBtn.textContent = "Copy code";
            copyBtn.classList.remove("is-copied");
          }, 1800);
        },
        () => {
          copyBtn.textContent = "Copy failed";
          window.setTimeout(() => {
            copyBtn.textContent = "Copy code";
          }, 1800);
        }
      );
    });

    toolbar.appendChild(langLabel);
    toolbar.appendChild(copyBtn);

    if (parent) {
      parent.insertBefore(shell, preEl);
      shell.appendChild(toolbar);
      shell.appendChild(preEl);
    }
  }
}
