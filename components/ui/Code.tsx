import type { ReactNode } from "react";
import { cx } from "@/lib/utils";

const TOKEN =
  /(\/\/.*$)|(^#{1,6} .*$)|('(?:\\.|[^'])*'|"(?:\\.|[^"])*"|`[^`]*`)|\b(export|function|return|switch|case|const|let|while|await|async|if|else|new|true|false|null|import|from|type)\b|\b(\d+(?:\.\d+)?)\b|([A-Z][A-Za-z0-9]+)|([a-z_$][\w$]*)(?=\()/gm;

// Markdown: only headings, inline code and quotes; prose words are not keywords.
const MD_TOKEN = /(^#{1,6} .*$)|(`[^`]*`|"[^"]*")/gm;

const CLASSES = ["", "text-muted italic", "text-accent", "text-[#f2c38b]", "text-accent", "text-[#b9a8ff]", "text-[#8fd3ff]", "text-fg"];
const MD_CLASSES = ["", "text-accent", "text-[#f2c38b]"];

/** Tiny dependency-free highlighter for the short TS/JS/Markdown snippets on the site. */
function highlight(code: string, markdown: boolean): ReactNode[] {
  const out: ReactNode[] = [];
  const classes = markdown ? MD_CLASSES : CLASSES;
  let last = 0;
  for (const m of code.matchAll(markdown ? MD_TOKEN : TOKEN)) {
    const i = m.index ?? 0;
    if (i > last) out.push(code.slice(last, i));
    const group = m.slice(1).findIndex((g) => g !== undefined) + 1;
    out.push(
      <span key={i} className={classes[group]}>
        {m[0]}
      </span>,
    );
    last = i + m[0].length;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}

export function Code({ code, file, className }: { code: string; file?: string; className?: string }) {
  return (
    <figure className={cx("overflow-hidden rounded-xl border border-line bg-[rgb(8_8_9/0.85)]", className)}>
      {file && (
        <figcaption className="mono-label flex items-center gap-2 border-b border-line px-4 py-2.5 normal-case tracking-normal text-muted">
          <span className="flex gap-1.5" aria-hidden>
            <i className="block h-2 w-2 rounded-full bg-[#3a3a3d]" />
            <i className="block h-2 w-2 rounded-full bg-[#3a3a3d]" />
            <i className="block h-2 w-2 rounded-full bg-[#3a3a3d]" />
          </span>
          <span className="truncate">{file}</span>
        </figcaption>
      )}
      <pre className="overflow-x-auto p-4 font-mono text-[0.78rem] leading-[1.7] text-fg/70 md:p-5 md:text-[0.82rem]">
        <code>{highlight(code, !!file?.endsWith(".md"))}</code>
      </pre>
    </figure>
  );
}
