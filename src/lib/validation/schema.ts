import { z } from "zod";

/**
 * The observation sheet. One row per participant in docs/validation/sessions.csv.
 * Single source for the CSV template, the parser, the summary script and the docs.
 */
export const SEGMENTS = ["agency_adviser", "developer", "platform", "individual"] as const;
export const RECRUITED_VIA = ["network", "community", "cold", "friend_family"] as const;
export const TASK_IDS = ["t1", "t2", "t3", "t4", "t5", "t6", "t7"] as const;
export const TASK_RESULTS = ["done", "partial", "failed", "skipped"] as const;
export const CONCEPTS = ["occupancy", "opex", "gross_vs_net", "appreciation", "inflation", "reinvest"] as const;
export const WTP_FEATURES = ["branding", "editable_assumptions", "saved_scenarios", "downloadable_reports"] as const;
export const WTP_LEVELS = ["no", "maybe", "yes", "already_pays", "not_asked"] as const;
export const NEED_KEYS = ["cross_device", "team_sharing", "controlled_property_data", "identity"] as const;
export const NEED_LEVELS = ["none", "nice", "must", "not_asked"] as const;
export const USE_AGAIN = ["yes", "maybe", "no", "not_asked"] as const;

/** Controlled vocabulary for the tag columns, so counts across participants are meaningful. */
export const TAGS = {
  distrust: ["mock_data", "yield_too_high", "no_source", "ignores_fees", "ignores_tax", "unrealistic_growth", "too_precise", "other"],
  explain: ["occupancy", "opex", "gross_vs_net", "appreciation", "inflation", "reinvest", "capital_call", "ownership_share", "roi", "other"],
  share: ["link", "pdf", "csv", "screenshot", "slides", "email", "other"],
  blockers: ["no_branding", "cant_save", "own_properties", "needs_login", "needs_team", "needs_integration", "not_my_workflow", "trust", "other"],
} as const;
export type TagCategory = keyof typeof TAGS;

const list = z.string().transform((s) => s.split(/[;|]/).map((t) => t.trim().toLowerCase()).filter(Boolean));
const optInt = z.string().transform((s, ctx) => {
  if (s.trim() === "") return null;
  const n = Number(s);
  if (!Number.isFinite(n) || n < 0) { ctx.addIssue({ code: "custom", message: "must be a number of zero or more" }); return z.NEVER; }
  return n;
});
const score = z.string().transform((s, ctx) => {
  if (s.trim() === "") return null;
  const n = Number(s);
  if (![0, 0.5, 1].includes(n)) { ctx.addIssue({ code: "custom", message: "must be 0, 0.5 or 1 (or blank if not asked)" }); return z.NEVER; }
  return n;
});

const taskResult = z.enum(TASK_RESULTS);
const wtpLevel = z.enum(WTP_LEVELS);
const needLevel = z.enum(NEED_LEVELS);

type TaskId = (typeof TASK_IDS)[number];
type Concept = (typeof CONCEPTS)[number];
type WtpFeature = (typeof WTP_FEATURES)[number];
type NeedKey = (typeof NEED_KEYS)[number];

// Built from the lists above so the columns, the parser and the docs can't disagree.
const taskShape = Object.fromEntries(
  TASK_IDS.flatMap((t) => [[`${t}_result`, taskResult], [`${t}_seconds`, optInt], [`${t}_help`, optInt]]),
) as { [K in TaskId as `${K}_result`]: typeof taskResult } & { [K in TaskId as `${K}_seconds`]: typeof optInt } & { [K in TaskId as `${K}_help`]: typeof optInt };
const conceptShape = Object.fromEntries(CONCEPTS.map((c) => [`comp_${c}`, score])) as { [K in Concept as `comp_${K}`]: typeof score };
const wtpShape = Object.fromEntries(WTP_FEATURES.map((f) => [`wtp_${f}`, wtpLevel])) as { [K in WtpFeature as `wtp_${K}`]: typeof wtpLevel };
const needShape = Object.fromEntries(NEED_KEYS.map((k) => [`need_${k}`, needLevel])) as { [K in NeedKey as `need_${K}`]: typeof needLevel };

export const sessionRowSchema = z.object({
  participant_id: z.string().min(1),
  segment: z.enum(SEGMENTS),
  recruited_via: z.enum(RECRUITED_VIA),
  session_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "use YYYY-MM-DD"),
  ...taskShape,
  ...conceptShape,
  tags_distrust: list,
  tags_explain: list,
  tags_share: list,
  tags_blockers: list,
  would_use_again: z.enum(USE_AGAIN),
  ...wtpShape,
  ...needShape,
  quotes: z.string(),
  notes: z.string(),
});

export type SessionRow = z.infer<typeof sessionRowSchema>;

/** Column order for the CSV template. */
export const SESSION_COLUMNS: string[] = [
  "participant_id", "segment", "recruited_via", "session_date",
  ...TASK_IDS.flatMap((t) => [`${t}_result`, `${t}_seconds`, `${t}_help`]),
  ...CONCEPTS.map((c) => `comp_${c}`),
  "tags_distrust", "tags_explain", "tags_share", "tags_blockers",
  "would_use_again",
  ...WTP_FEATURES.map((f) => `wtp_${f}`),
  ...NEED_KEYS.map((k) => `need_${k}`),
  "quotes", "notes",
];
