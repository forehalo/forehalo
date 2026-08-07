import { useEffect } from "react";
import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { COMMITS, parseLogMessage, type LogCommit } from "@/pages/home/log-data";
import { PROJECTS, formatStars } from "@/lib/projects";

/**
 * RESUME — `/resume`. The serious counterpart to the animated pages: a
 * plain, printable curriculum vitae — no framer-motion, no CompilePrint,
 * nothing scroll-linked. Static markup only, so reduced-motion needs no
 * gating here and the page prints cleanly.
 *
 * Data is NOT duplicated: experience/education derive from COMMITS
 * (@/pages/home/log-data, the career source of truth) and open source
 * from PROJECTS (@/lib/projects). Only display titles too terse for a
 * resume are curated here, keyed by commit sha.
 */

const META_TITLE = "resume · Yii";
const META_DESC =
  "Resume of Liu Yi (Yii) — engineering leader. Rust, TypeScript, CRDT, developer tools. Co-creator of napi-rs, shipped AFFiNE, created Perfsee.";

/** Resume-grade titles per role; the log's terse `rest` is the fallback. */
const ROLE_TITLES: Record<string, string> = {
  f0e4a11: "Independent Contributor",
  "9c3e1d7": "Tech Leader",
  "57b2aa1": "Frontend Architect",
  "1a0ff00": "Frontend Engineer",
  "7d3b9c2": "Frontend Engineer",
};

/**
 * Experience = the main lane only (employment history). The branch lane
 * (napi-rs) is open source work — it lives in the section below, not here.
 */
const EXPERIENCE = COMMITS.filter((c) => !c.root && c.lane === "main");
const EDUCATION = COMMITS.filter((c) => c.root);

interface OssEntry {
  name: string;
  tagline: string;
  href: string;
  date: string;
  stars?: string;
}

/**
 * Project periods, from the career log / project pages where they are
 * recorded (@/pages/home/log-data, @/pages/perfsee) — dates are NOT
 * re-invented here.
 */
const OSS_DATES: Record<string, string> = {
  AFFiNE: "2023 → 2025",
  "napi-rs": "2021 →",
  Perfsee: "2020 → 2023",
};

/** Projects with a public repo and a star count, most starred first. */
const OPEN_SOURCE: OssEntry[] = PROJECTS.filter((p) => p.github && p.stars)
  .sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0))
  .map((p) => ({
    name: p.name,
    tagline: p.tagline,
    href: p.github ?? "",
    date: OSS_DATES[p.name] ?? "",
    stars: p.stars ? formatStars(p.stars) : undefined,
  }));

// Branch-lane commits are open source work (@/pages/home/log-data). The
// registry above already covers napi-rs; surface any branch project it
// doesn't (vite-plus) — the data lives once, in the career log.
for (const c of COMMITS.filter((c) => c.lane === "branch")) {
  const { scope, rest } = parseLogMessage(c.message);
  if (OPEN_SOURCE.some((p) => p.name === scope)) continue;
  const role = rest.replace(/^./, (ch) => ch.toUpperCase());
  const what = c.diff.map((l) => l.replace(/^\+\s*/, "")).join("; ");
  OPEN_SOURCE.push({
    name: scope,
    tagline: what ? `${role}. ${what}` : role,
    href: c.link?.href ?? "",
    date: c.date,
    stars: c.facts?.find((f) => f.label.startsWith("★"))?.label,
  });
}

const CONTACTS = [
  { label: "contact@thatyii.dev", href: "mailto:contact@thatyii.dev" },
  { label: "github.com/forehalo", href: "https://github.com/forehalo" },
  { label: "x.com/forehalo", href: "https://x.com/forehalo" },
  { label: "thatyii.dev", href: "https://thatyii.dev" },
];

const SKILLS: { area: string; items: string[] }[] = [
  { area: "Languages", items: ["Rust", "TypeScript"] },
  {
    area: "Domains",
    items: [
      "Native, Web, Server",
      "Node.js native addons (N-API / FFI)",
      "CRDT & local-first collaborative architecture",
      "Performance analysis",
      "Monorepo governance & devtools",
    ],
  },
  { area: "Leadership", items: ["Engineering", "Architecture", "Mentoring"] },
];

export default function Resume() {
  // page meta
  useEffect(() => {
    const prevTitle = document.title;
    const desc = document.querySelector('meta[name="description"]');
    const prevDesc = desc?.getAttribute("content") ?? null;
    document.title = META_TITLE;
    desc?.setAttribute("content", META_DESC);
    return () => {
      document.title = prevTitle;
      if (desc && prevDesc !== null) desc.setAttribute("content", prevDesc);
    };
  }, []);

  return (
    <article className="mx-auto w-full max-w-[1360px] px-6 py-10 md:px-16 md:py-14 print:py-0">
      <div className="max-w-[760px]">
        {/* ── header ─────────────────────────────────────────────── */}
        <header>
          <p className="micro text-dim print:hidden">$ cat ~/resume.md</p>
          <h1 className="mt-4 font-grotesk text-4xl font-bold tracking-tight text-bone md:text-5xl print:mt-0">
            Liu Yi
          </h1>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 print:mt-3">
            {CONTACTS.map((c) => (
              <li key={c.href}>
                <a
                  href={c.href}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor="link"
                  className="inline-flex items-center gap-1 font-mono text-[12px] text-ash transition-colors hover:text-halo"
                >
                  {c.label}
                  <ArrowUpRight size={12} aria-hidden />
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 max-w-[60ch] text-[14px] leading-relaxed text-ash print:mt-3 print:leading-normal">
            I lead teams and write code. Nearly ten years of shipping — from frontend infrastructure
            to Rust native/FFI, CRDT, and agent building. I bring deep experience in performance
            optimization, architecture design, and long-term projects stewardship.
          </p>
        </header>

        {/* ── experience ─────────────────────────────────────────── */}
        <Section title="experience">
          <ol className="space-y-10 print:space-y-6">
            {EXPERIENCE.map((c) => (
              <Role key={c.sha} commit={c} />
            ))}
          </ol>
        </Section>

        {/* ── open source ────────────────────────────────────────── */}
        <Section title="open source">
          <ul className="space-y-5 print:space-y-4">
            {OPEN_SOURCE.map((p) => (
              <li
                key={p.name}
                className="flex items-baseline justify-between gap-4 print:break-inside-avoid"
              >
                <div className="min-w-0">
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noreferrer"
                    data-cursor="link"
                    className="inline-flex items-center gap-1 font-medium text-bone transition-colors hover:text-halo"
                  >
                    {p.name}
                    <ArrowUpRight size={12} aria-hidden className="text-dim" />
                  </a>
                  {p.stars && (
                    <span className="ml-2 font-mono text-[11px] text-dim">{p.stars}</span>
                  )}
                  <p className="mt-1 text-[13px] leading-relaxed text-ash print:leading-normal">
                    {p.tagline}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-[12px] text-dim">{p.date}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* ── skills ─────────────────────────────────────────────── */}
        <Section title="skills">
          <dl className="space-y-4 print:space-y-3">
            {SKILLS.map((s) => (
              <div key={s.area} className="grid gap-1 sm:grid-cols-[140px_1fr] sm:gap-4">
                <dt className="font-mono text-[12px] uppercase tracking-[0.14em] text-dim">
                  {s.area}
                </dt>
                <dd className="text-[13px] leading-relaxed text-ash print:leading-normal">
                  {s.items.join(" · ")}
                </dd>
              </div>
            ))}
          </dl>
        </Section>

        {/* ── education ──────────────────────────────────────────── */}
        <Section title="education">
          <ul className="space-y-6 print:space-y-4">
            {EDUCATION.map((c) => {
              const { scope, rest } = parseLogMessage(c.message);
              // the field of study lives in the root commit's diff
              // ("+ software engineering"); the log's `rest` ("initial
              // commit") is git flavor, not resume content
              const degree = (c.diff[0] ?? rest)
                .replace(/^\+\s*/, "")
                .replace(/^./, (ch) => ch.toUpperCase());
              return (
                <li
                  key={c.sha}
                  className="flex items-baseline justify-between gap-4 print:break-inside-avoid"
                >
                  <div>
                    <h3 className="font-medium text-bone">{scope}</h3>
                    <p className="mt-1 text-[13px] text-ash">{degree}</p>
                  </div>
                  <span className="shrink-0 font-mono text-[12px] text-dim">{c.date}</span>
                </li>
              );
            })}
          </ul>
        </Section>
      </div>
    </article>
  );
}

/* ── pieces ─────────────────────────────────────────────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12 print:mt-8">
      <h2 className="hud mb-6 border-b border-steel pb-3 text-dim print:mb-4 print:pb-2 print:break-after-avoid">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Role({ commit: c }: { commit: LogCommit }) {
  const { scope, rest } = parseLogMessage(c.message);
  const title = ROLE_TITLES[c.sha] ?? rest;
  // log diff lines are "+ change" — a resume prints the change itself,
  // sentence-cased
  const bullets = c.diff.map((line) =>
    line.replace(/^\+\s*/, "").replace(/^./, (ch) => ch.toUpperCase()),
  );
  // The company name carries the organization link (`link` on the commit) —
  // facts (stars, "inspires …") stay on the other surfaces, not the resume.
  const link = c.link;
  return (
    <li className="print:break-inside-avoid">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="font-medium text-bone">
          {title}
          <span className="text-dim"> · </span>
          {link ? (
            <a
              href={link.href}
              target="_blank"
              rel="noreferrer"
              data-cursor="link"
              className="inline-flex items-baseline gap-1 text-ash transition-colors hover:text-halo"
            >
              {scope}
              <ArrowUpRight size={11} aria-hidden className="self-center text-dim" />
            </a>
          ) : (
            <span className="text-ash">{scope}</span>
          )}
          {/* site navigation, not resume content — screen only */}
          {c.linkChip && (
            <Link
              to={c.linkChip.to}
              data-cursor="link"
              className="ml-2 font-mono text-[11px] font-normal text-dim transition-colors hover:text-halo print:hidden"
            >
              details →
            </Link>
          )}
        </h3>
        <span className="font-mono text-[12px] text-dim">{c.date}</span>
      </div>

      {c.tags.length > 0 && (
        <p className="mt-1 font-mono text-[11px] text-dim">{c.tags.join(" · ")}</p>
      )}

      {bullets.length > 0 && (
        <ul className="mt-3 space-y-1.5 print:mt-2">
          {bullets.map((b) => (
            <li
              key={b}
              className="flex gap-2 text-[13px] leading-relaxed text-ash print:leading-normal"
            >
              <span aria-hidden className="shrink-0 text-halo">
                –
              </span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
