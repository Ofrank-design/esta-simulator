import fs from "node:fs";
import path from "node:path";
import { parseSessions } from "../src/lib/validation/summary";
import { renderSummaryMarkdown, summarize } from "../src/lib/validation/summary";

const root = path.resolve(import.meta.dirname, "..");
const input = path.resolve(process.argv[2] ?? path.join(root, "docs/validation/sessions.csv"));
const output = path.join(root, "docs/validation/RESULTS.md");

if (!fs.existsSync(input)) {
  console.error(`No file at ${path.relative(root, input)}.\nCopy docs/validation/sessions.template.csv to docs/validation/sessions.csv and add one row per participant.`);
  process.exit(1);
}
const { rows, errors, warnings } = parseSessions(fs.readFileSync(input, "utf8"));
if (errors.length) {
  console.error("Fix these before the summary can run:\n" + errors.map((e) => `  ${e}`).join("\n"));
  process.exit(1);
}
const md = renderSummaryMarkdown(summarize(rows), warnings);
fs.writeFileSync(output, md);
console.log(`Wrote ${path.relative(root, output)} from ${rows.length} participant${rows.length === 1 ? "" : "s"}.`);
for (const w of warnings) console.log(`  note: ${w}`);
