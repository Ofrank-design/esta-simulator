import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { parseCsv, csvEscape } from "./csv";
import { SESSION_COLUMNS, TASK_IDS } from "./schema";
import { MIN_SESSIONS, parseSessions, renderSummaryMarkdown, repeatedThreshold, summarize } from "./summary";

/**
 * SYNTHETIC DATA. These rows are invented to test the arithmetic and the gate logic.
 * They are not research results and must never be presented as such.
 */
function csvOf(rows: Record<string, string>[]): string {
  const blank: Record<string, string> = Object.fromEntries(SESSION_COLUMNS.map((c) => [c, ""]));
  for (const t of TASK_IDS) Object.assign(blank, { [`${t}_result`]: "done", [`${t}_seconds`]: "60", [`${t}_help`]: "0" });
  Object.assign(blank, {
    segment: "agency_adviser", recruited_via: "network", session_date: "2026-11-02", would_use_again: "maybe",
    wtp_branding: "not_asked", wtp_editable_assumptions: "not_asked", wtp_saved_scenarios: "not_asked", wtp_downloadable_reports: "not_asked",
    need_cross_device: "none", need_team_sharing: "none", need_controlled_property_data: "none", need_identity: "none",
  });
  const lines = [SESSION_COLUMNS.join(",")];
  rows.forEach((r, i) => {
    const full: Record<string, string> = { ...blank, participant_id: `P${i + 1}`, ...r };
    lines.push(SESSION_COLUMNS.map((c) => csvEscape(full[c] ?? "")).join(","));
  });
  return lines.join("\r\n") + "\r\n";
}
const load = (rows: Record<string, string>[]) => {
  const parsed = parseSessions(csvOf(rows));
  expect(parsed.errors).toEqual([]);
  return parsed;
};

describe("csv reader", () => {
  it("handles quotes, commas, doubled quotes and newlines inside quotes, CRLF and a BOM", () => {
    const t = parseCsv('\uFEFFa,b,c\r\n1,"x, y","say ""hi"""\r\n"line\nbreak",2,3\r\n\r\n');
    expect(t).toEqual([["a", "b", "c"], ["1", "x, y", 'say "hi"'], ["line\nbreak", "2", "3"]]);
  });
  it("round-trips through csvEscape", () => {
    const vals = ['plain', 'a,b', 'q"uote', "multi\nline"];
    expect(parseCsv(vals.map(csvEscape).join(","))[0]).toEqual(vals);
  });
});

describe("template", () => {
  it("docs/validation/sessions.template.csv matches the schema columns (run `npm run validation:template`)", () => {
    const file = fs.readFileSync(path.resolve(import.meta.dirname, "../../../docs/validation/sessions.template.csv"), "utf8");
    expect(file.trim().split(",")).toEqual(SESSION_COLUMNS);
  });
  it("an empty template yields zero participants without crashing", () => {
    const parsed = parseSessions(SESSION_COLUMNS.join(",") + "\n");
    expect(parsed.rows).toEqual([]);
    const s = summarize(parsed.rows);
    expect(s.n).toBe(0);
    expect(s.backendJustified).toBe(false);
    expect(renderSummaryMarkdown(s)).toContain("not enough sessions to decide");
  });
});

describe("validation of rows", () => {
  it("reports the row and column of every problem", () => {
    const text = csvOf([{}, { segment: "robot", t2_seconds: "-4", comp_occupancy: "0.7" }]);
    const { errors } = parseSessions(text);
    expect(errors.some((e) => e.startsWith('Row 3, column "segment"'))).toBe(true);
    expect(errors.some((e) => e.startsWith('Row 3, column "t2_seconds"'))).toBe(true);
    expect(errors.some((e) => e.startsWith('Row 3, column "comp_occupancy"'))).toBe(true);
  });
  it("rejects duplicate participants and missing columns", () => {
    expect(parseSessions(csvOf([{ participant_id: "P1" }, { participant_id: "P1" }])).errors.join(" ")).toMatch(/used twice/);
    expect(parseSessions("participant_id,segment\nP1,agency_adviser").errors[0]).toMatch(/Missing columns/);
  });
  it("warns, rather than fails, on tags outside the vocabulary and counts them as other", () => {
    const parsed = load([{ tags_distrust: "mock_data;weird_new_tag" }]);
    expect(parsed.warnings.join(" ")).toMatch(/weird_new_tag/);
    const s = summarize(parsed.rows);
    expect(s.themes.find((t) => t.category === "distrust" && t.tag === "other")?.participants).toBe(1);
  });
  it("accepts semicolons or pipes between tags, ignoring case and spaces", () => {
    const { rows } = load([{ tags_share: " Link | CSV ; pdf " }]);
    expect(rows[0].tags_share).toEqual(["link", "csv", "pdf"]);
  });
});

describe("summary", () => {
  it("refuses to decide on fewer than 5 sessions and says why", () => {
    const s = summarize(load([{ need_team_sharing: "must" }, { need_team_sharing: "must" }, { need_team_sharing: "must" }, { need_team_sharing: "must" }]).rows);
    expect(s.n).toBe(4);
    expect(s.backendJustified).toBe(false);
    expect(s.needs.every((x) => !x.met)).toBe(true);
    expect(s.cautions[0]).toMatch(/Only 4 sessions/);
  });

  it("uses a threshold of at least 3 participants, or 40%", () => {
    expect(repeatedThreshold(5)).toBe(3);
    expect(repeatedThreshold(8)).toBe(4);
    expect(repeatedThreshold(10)).toBe(4);
    expect(MIN_SESSIONS).toBe(5);
  });

  const six = () => load([
    { t2_result: "done", t2_seconds: "40", t2_help: "0", comp_occupancy: "1", comp_gross_vs_net: "0", tags_distrust: "no_source", tags_share: "pdf;link", would_use_again: "yes", wtp_branding: "yes", wtp_downloadable_reports: "yes", need_team_sharing: "must", need_cross_device: "must" },
    { t2_result: "done", t2_seconds: "80", t2_help: "1", comp_occupancy: "1", comp_gross_vs_net: "0.5", tags_distrust: "no_source;ignores_fees", tags_share: "pdf", would_use_again: "yes", wtp_branding: "yes", wtp_downloadable_reports: "maybe", need_team_sharing: "must", need_cross_device: "nice" },
    { t2_result: "partial", t2_seconds: "120", t2_help: "2", comp_occupancy: "0.5", comp_gross_vs_net: "0", tags_distrust: "no_source", tags_share: "pdf;csv", would_use_again: "maybe", wtp_branding: "already_pays", wtp_downloadable_reports: "yes", need_team_sharing: "must", need_cross_device: "none" },
    { t2_result: "failed", t2_seconds: "", t2_help: "3", comp_occupancy: "0", comp_gross_vs_net: "0", tags_share: "link", would_use_again: "no", wtp_branding: "no", wtp_downloadable_reports: "no", need_team_sharing: "nice", need_cross_device: "must" },
    { t2_result: "done", t2_seconds: "60", t2_help: "0", comp_occupancy: "1", comp_gross_vs_net: "1", would_use_again: "yes", wtp_branding: "maybe", wtp_downloadable_reports: "not_asked", need_team_sharing: "none", need_cross_device: "none" },
    { t2_result: "skipped", t2_seconds: "", t2_help: "", comp_occupancy: "", comp_gross_vs_net: "", would_use_again: "not_asked", wtp_branding: "not_asked", wtp_downloadable_reports: "not_asked", recruited_via: "friend_family" },
  ]);

  it("tallies tasks: completion excludes skipped, medians ignore blanks, help requests add up", () => {
    const t2 = summarize(six().rows).tasks.find((t) => t.id === "t2")!;
    expect([t2.done, t2.partial, t2.failed, t2.skipped]).toEqual([3, 1, 1, 1]);
    expect(t2.completionRate).toBeCloseTo(3 / 5, 10);
    expect(t2.medianSeconds).toBe(70); // 40, 60, 80, 120
    expect(t2.helpRequests).toBe(6);
  });

  it("averages comprehension over only the people who were asked", () => {
    const c = summarize(six().rows).comprehension;
    const occ = c.find((x) => x.concept === "occupancy")!;
    expect(occ.asked).toBe(5);
    expect(occ.meanScore).toBeCloseTo((1 + 1 + 0.5 + 0 + 1) / 5, 10);
    expect(occ.fullyCorrect).toBe(3);
    expect(c.find((x) => x.concept === "gross_vs_net")!.meanScore).toBeCloseTo(1.5 / 5, 10);
    expect(c.find((x) => x.concept === "inflation")!.asked).toBe(0);
    expect(c.find((x) => x.concept === "inflation")!.meanScore).toBeNull();
  });

  it("counts a theme once per participant and flags repeated ones", () => {
    const themes = summarize(six().rows).themes;
    const noSource = themes.find((t) => t.tag === "no_source")!;
    expect(noSource.participants).toBe(3);
    expect(noSource.repeated).toBe(true); // threshold for 6 is 3
    expect(themes.find((t) => t.tag === "ignores_fees")!.repeated).toBe(false);
    expect(themes.find((t) => t.category === "share" && t.tag === "pdf")!.participants).toBe(3);
  });

  it("counts positive willingness to pay as yes plus already pays", () => {
    const wtp = summarize(six().rows).wtp;
    expect(wtp.find((w) => w.feature === "branding")!.positive).toBe(3);
    expect(wtp.find((w) => w.feature === "branding")!.repeated).toBe(true);
    expect(wtp.find((w) => w.feature === "downloadable_reports")!.positive).toBe(2);
    expect(wtp.find((w) => w.feature === "downloadable_reports")!.repeated).toBe(false);
  });

  it("opens the backend gate only for needs that enough people called a must have", () => {
    const s = summarize(six().rows);
    const need = (k: string) => s.needs.find((x) => x.key === k)!;
    expect(need("team_sharing")).toMatchObject({ must: 3, met: true });
    expect(need("cross_device")).toMatchObject({ must: 2, met: false });
    expect(need("identity").met).toBe(false);
    expect(s.backendJustified).toBe(true);
  });

  it("keeps the gate shut when needs are only nice to have", () => {
    const rows = load(Array.from({ length: 6 }, () => ({ need_cross_device: "nice", need_identity: "nice", need_team_sharing: "nice" }))).rows;
    const s = summarize(rows);
    expect(s.backendJustified).toBe(false);
    expect(renderSummaryMarkdown(s)).toContain("the gate is not met");
  });

  it("warns about friends and family, and about mixed segments", () => {
    const rows = load([{ recruited_via: "friend_family" }, { recruited_via: "friend_family" }, { recruited_via: "friend_family" }, { segment: "individual" }, {}]).rows;
    const text = summarize(rows).cautions.join(" ");
    expect(text).toMatch(/friends or family/);
    expect(text).toMatch(/More than one customer segment/);
  });

  it("renders a report with the decision and the signal counts", () => {
    const md = renderSummaryMarkdown(summarize(six().rows));
    expect(md).toContain("Participants: **6**");
    expect(md).toContain("the gate is met for at least one need");
    expect(md).toContain("White label calculator signals");
    expect(md).toContain("| T2 | 3 | 1 | 1 | 1 | 60% |");
  });
});
