import { parseCsv } from "./csv";
import {
  CONCEPTS, NEED_KEYS, SEGMENTS, SESSION_COLUMNS, TAGS, TASK_IDS, WTP_FEATURES, sessionRowSchema,
  type SessionRow, type TagCategory,
} from "./schema";

export const MIN_SESSIONS = 5;
/** A pattern counts as repeated evidence when at least this many participants show it. */
export const repeatedThreshold = (n: number) => Math.max(3, Math.ceil(0.4 * n));

export interface ParseResult {
  rows: SessionRow[];
  errors: string[];
  warnings: string[];
}

/** Reads and validates the CSV. Row numbers match the spreadsheet (header is row 1). */
export function parseSessions(text: string): ParseResult {
  const table = parseCsv(text);
  const errors: string[] = [];
  const warnings: string[] = [];
  if (table.length === 0) return { rows: [], errors: [], warnings: ["The file has no rows yet."] };

  const header = table[0].map((h) => h.trim());
  const missing = SESSION_COLUMNS.filter((c) => !header.includes(c));
  if (missing.length) return { rows: [], errors: [`Missing columns: ${missing.join(", ")}`], warnings };
  const extra = header.filter((h) => !SESSION_COLUMNS.includes(h));
  if (extra.length) warnings.push(`Ignoring unknown columns: ${extra.join(", ")}`);

  const rows: SessionRow[] = [];
  const seen = new Set<string>();
  table.slice(1).forEach((cells, i) => {
    const line = i + 2;
    const obj: Record<string, string> = {};
    header.forEach((h, idx) => { obj[h] = (cells[idx] ?? "").trim(); });
    const parsed = sessionRowSchema.safeParse(obj);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) errors.push(`Row ${line}, column "${issue.path.join(".")}": ${issue.message}`);
      return;
    }
    if (seen.has(parsed.data.participant_id)) errors.push(`Row ${line}: participant_id "${parsed.data.participant_id}" is used twice`);
    seen.add(parsed.data.participant_id);
    for (const cat of Object.keys(TAGS) as TagCategory[]) {
      for (const tag of parsed.data[`tags_${cat}`]) {
        if (!(TAGS[cat] as readonly string[]).includes(tag)) warnings.push(`Row ${line}: "${tag}" isn't in the ${cat} vocabulary, so it is counted under "other".`);
      }
    }
    rows.push(parsed.data);
  });
  return { rows, errors, warnings };
}

const median = (xs: number[]): number | null => {
  if (xs.length === 0) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const mean = (xs: number[]): number | null => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
const count = <T,>(xs: T[], pred: (x: T) => boolean) => xs.filter(pred).length;

export interface Summary {
  n: number;
  threshold: number;
  segments: Record<string, number>;
  cautions: string[];
  tasks: { id: string; done: number; partial: number; failed: number; skipped: number; completionRate: number | null; medianSeconds: number | null; helpRequests: number }[];
  comprehension: { concept: string; asked: number; meanScore: number | null; fullyCorrect: number }[];
  themes: { category: TagCategory; tag: string; participants: number; repeated: boolean }[];
  wouldUseAgain: Record<string, number>;
  wtp: { feature: string; counts: Record<string, number>; positive: number; repeated: boolean }[];
  needs: { key: string; must: number; nice: number; none: number; met: boolean }[];
  /** True only when there are enough sessions AND at least one gate condition has repeated "must have" evidence. */
  backendJustified: boolean;
  signals: { whiteLabelCalculator: number; accounts: number };
}

export function summarize(rows: SessionRow[]): Summary {
  const n = rows.length;
  const threshold = repeatedThreshold(n);
  const cautions: string[] = [];
  if (n < MIN_SESSIONS) cautions.push(`Only ${n} session${n === 1 ? "" : "s"}. The roadmap asks for 5 to 10. Treat everything below as anecdotes, not evidence, and don't use it to make the backend decision.`);
  const friends = count(rows, (r) => r.recruited_via === "friend_family");
  if (n > 0 && friends / n > 0.5) cautions.push(`${friends} of ${n} participants are friends or family. They tend to be kind. Weight their feedback less, and recruit people who owe you nothing.`);
  const segs = Object.fromEntries(SEGMENTS.map((s) => [s, count(rows, (r) => r.segment === s)]));
  if (Object.values(segs).filter((v) => v > 0).length > 1) cautions.push("More than one customer segment is mixed in. Their needs differ, so read the results per segment before combining them.");

  const tasks = TASK_IDS.map((id) => {
    const result = rows.map((r) => r[`${id}_result` as const]);
    const done = count(result, (x) => x === "done");
    const partial = count(result, (x) => x === "partial");
    const failed = count(result, (x) => x === "failed");
    const skipped = count(result, (x) => x === "skipped");
    const attempted = n - skipped;
    return {
      id, done, partial, failed, skipped,
      completionRate: attempted > 0 ? done / attempted : null,
      medianSeconds: median(rows.flatMap((r) => (r[`${id}_seconds` as const] === null ? [] : [r[`${id}_seconds` as const] as number]))),
      helpRequests: rows.reduce((a, r) => a + ((r[`${id}_help` as const] as number | null) ?? 0), 0),
    };
  });

  const comprehension = CONCEPTS.map((concept) => {
    const scores = rows.flatMap((r) => (r[`comp_${concept}` as const] === null ? [] : [r[`comp_${concept}` as const] as number]));
    return { concept, asked: scores.length, meanScore: mean(scores), fullyCorrect: count(scores, (s) => s === 1) };
  });

  const themes: Summary["themes"] = [];
  for (const category of Object.keys(TAGS) as TagCategory[]) {
    const tally = new Map<string, number>();
    for (const r of rows) {
      const known = new Set(r[`tags_${category}`].map((t) => ((TAGS[category] as readonly string[]).includes(t) ? t : "other")));
      known.forEach((t) => tally.set(t, (tally.get(t) ?? 0) + 1));
    }
    [...tally.entries()].sort((a, b) => b[1] - a[1]).forEach(([tag, participants]) =>
      themes.push({ category, tag, participants, repeated: n >= MIN_SESSIONS && participants >= threshold }));
  }

  const tallyOf = (vals: string[]) => vals.reduce<Record<string, number>>((o, v) => ({ ...o, [v]: (o[v] ?? 0) + 1 }), {});
  const wouldUseAgain = tallyOf(rows.map((r) => r.would_use_again));

  const wtp = WTP_FEATURES.map((feature) => {
    const counts = tallyOf(rows.map((r) => r[`wtp_${feature}` as const]));
    const positive = (counts.yes ?? 0) + (counts.already_pays ?? 0);
    return { feature, counts, positive, repeated: n >= MIN_SESSIONS && positive >= threshold };
  });

  const needs = NEED_KEYS.map((key) => {
    const vals = rows.map((r) => r[`need_${key}` as const]);
    const must = count(vals, (v) => v === "must");
    return { key, must, nice: count(vals, (v) => v === "nice"), none: count(vals, (v) => v === "none"), met: n >= MIN_SESSIONS && must >= threshold };
  });

  const wtpPos = (f: string) => wtp.find((w) => w.feature === f)?.positive ?? 0;
  const needMust = (k: string) => needs.find((x) => x.key === k)?.must ?? 0;
  return {
    n, threshold, segments: segs, cautions, tasks, comprehension, themes, wouldUseAgain, wtp, needs,
    backendJustified: needs.some((x) => x.met),
    signals: {
      whiteLabelCalculator: wtpPos("branding") + wtpPos("editable_assumptions") + wtpPos("downloadable_reports"),
      accounts: needMust("cross_device") + needMust("identity") + needMust("team_sharing") + wtpPos("saved_scenarios"),
    },
  };
}

const pct = (x: number | null) => (x === null ? "n/a" : `${Math.round(x * 100)}%`);
const label = (s: string) => s.replace(/_/g, " ");

export function renderSummaryMarkdown(s: Summary, warnings: string[] = []): string {
  const L: string[] = ["# Validation results", "", `Generated from \`docs/validation/sessions.csv\`. Participants: **${s.n}**. Repeated evidence means at least **${s.threshold}** participants.`, ""];
  if (s.cautions.length) L.push("## Read this first", "", ...s.cautions.map((c) => `- ${c}`), "");
  if (warnings.length) L.push("## Data notes", "", ...warnings.map((w) => `- ${w}`), "");

  L.push("## Tasks", "", "| Task | Done | Partial | Failed | Skipped | Completion | Median time (s) | Help requests |", "| --- | --- | --- | --- | --- | --- | --- | --- |");
  for (const t of s.tasks) L.push(`| ${t.id.toUpperCase()} | ${t.done} | ${t.partial} | ${t.failed} | ${t.skipped} | ${pct(t.completionRate)} | ${t.medianSeconds ?? "n/a"} | ${t.helpRequests} |`);

  L.push("", "## Did people understand the concepts?", "", "| Concept | Asked | Average score | Fully correct |", "| --- | --- | --- | --- |");
  for (const c of s.comprehension) L.push(`| ${label(c.concept)} | ${c.asked} | ${pct(c.meanScore)} | ${c.fullyCorrect} |`);

  L.push("", "## Themes (number of participants)", "");
  for (const cat of Object.keys(TAGS) as TagCategory[]) {
    const rows = s.themes.filter((t) => t.category === cat);
    L.push(`**${cat}**: ` + (rows.length ? rows.map((t) => `${label(t.tag)} ${t.participants}${t.repeated ? " (repeated)" : ""}`).join(", ") : "none recorded"), "");
  }

  L.push("## Would they use it again?", "", Object.entries(s.wouldUseAgain).map(([k, v]) => `${label(k)}: ${v}`).join(", ") || "none recorded", "");

  L.push("## Would a business pay for it?", "", "| Feature | No | Maybe | Yes | Already pays | Not asked | Repeated |", "| --- | --- | --- | --- | --- | --- | --- |");
  for (const w of s.wtp) L.push(`| ${label(w.feature)} | ${w.counts.no ?? 0} | ${w.counts.maybe ?? 0} | ${w.counts.yes ?? 0} | ${w.counts.already_pays ?? 0} | ${w.counts.not_asked ?? 0} | ${w.repeated ? "yes" : "no"} |`);

  L.push("", "## The backend gate", "", "The roadmap says not to build a backend until an important need depends on saved work across devices, shared team data, controlled property data, or user identity. \"Important\" here means participants called it a **must have**, and at least " + s.threshold + " did.", "", "| Need | Must have | Nice to have | Not needed | Gate met |", "| --- | --- | --- | --- | --- |");
  for (const x of s.needs) L.push(`| ${label(x.key)} | ${x.must} | ${x.nice} | ${x.none} | ${x.met ? "yes" : "no"} |`);
  L.push("", s.n < MIN_SESSIONS
    ? "**Decision: not enough sessions to decide.** Keep ESTA client side and run more sessions."
    : s.backendJustified
      ? "**Decision: the gate is met for at least one need.** A backend is justified for that need only. Build the smallest thing that serves it."
      : "**Decision: the gate is not met.** Keep ESTA client side and improve what the sessions showed.", "");

  L.push("## Which direction do the signals point?", "", `- White label calculator signals (yes or already pays for branding, editable assumptions, downloadable reports): **${s.signals.whiteLabelCalculator}**`, `- User account signals (must have needs for cross device, identity, team sharing, plus yes for saved scenarios): **${s.signals.accounts}**`, "", "These are counts to inform a decision, not a decision. Read the quotes before choosing.", "");
  return L.join("\n");
}
