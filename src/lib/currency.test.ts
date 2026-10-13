import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

/** The simulator displays US dollars only. "AED" may appear in these places and nowhere else. */
const ALLOWED = [
  "src/lib/data/properties.ts", // documents the one-time conversion
  "src/lib/simulator/params.ts", // legacy link notice and versioning note
];

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}

describe("currency convention", () => {
  const root = path.resolve(import.meta.dirname, "../..");
  const files = walk(path.join(root, "src")).filter((f) => /\.(ts|tsx|css)$/.test(f) && !/\.test\./.test(f));

  it("has no AED labels or formatters in active source files", () => {
    const offenders = files
      .map((f) => path.relative(root, f))
      .filter((rel) => !ALLOWED.includes(rel))
      .filter((rel) => /AED|dirham|د\.إ/i.test(fs.readFileSync(path.join(root, rel), "utf8")));
    expect(offenders).toEqual([]);
  });

  it("has no Aed-named identifiers anywhere", () => {
    const offenders = files.filter((f) => /Aed\b|Aed[A-Z]|[a-z]Aed/.test(fs.readFileSync(f, "utf8")));
    expect(offenders.map((f) => path.relative(root, f))).toEqual([]);
  });
});
