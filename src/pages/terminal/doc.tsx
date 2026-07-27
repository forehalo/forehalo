import type { ReactNode } from "react";

/**
 * Shared text-doc primitives for the /terminal project forks (terminal.md
 * §doc) — man-page style: left-aligned, mono, content constrained to
 * ~max-w-3xl by the page. Other agents build the fork bodies from these.
 */

/** uppercase man-page title + thin steel rule, optional one-line tagline */
export function DocHeader({ title, tagline }: { title: string; tagline?: string }) {
  return (
    <header className="border-b border-steel pb-3">
      <h1 className="text-[15px] font-bold uppercase tracking-[0.14em] text-bone">{title}</h1>
      {tagline ? <p className="mt-1 text-[12px] text-ash">{tagline}</p> : null}
    </header>
  );
}

/** `## `-style halo heading + body slot */
export function DocSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="text-[13px] text-halo">
        {"## "}
        {title}
      </h2>
      <div className="mt-2 text-[12px] leading-[1.9] text-ash">{children}</div>
    </section>
  );
}

/** key/value row — cyan key, ash value */
export function DocKv({ k, children }: { k: string; children: ReactNode }) {
  return (
    <div className="flex gap-2 text-[12px] leading-[1.9]">
      <span className="shrink-0 text-wasi-cyan">{k}:</span>
      <span className="text-ash">{children}</span>
    </div>
  );
}

/** external halo link */
export function DocLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="text-halo underline">
      {children}
    </a>
  );
}

/** `+ `-prefixed items in ash */
export function DocList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="text-[12px] leading-[1.9]">
      {items.map((item, i) => (
        // eslint-disable-next-line react/no-array-index-key -- static doc content
        <li key={i} className="text-ash">
          {"+ "}
          {item}
        </li>
      ))}
    </ul>
  );
}
