import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

/** User-facing wording must not promise results or sound like marketing filler. */
const BANNED: [RegExp, string][] = [
  [/high[- ]performing/i, "high performing"],
  [/expected real return/i, "expected real return"],
  [/(?<!not |never |no |isn't |nothing is )guaranteed/i, "guaranteed"],
  [/\bunlock\b/i, "unlock"],
  [/revolutioni[sz]e/i, "revolutionize"],
  [/\bleverag(e|ing)\b/i, "leverage"],
  [/maximi[sz]e your/i, "maximize your"],
  [/wealth[- ]building/i, "wealth building"],
  [/institutional[- ]grade/i, "institutional grade"],
  [/no hidden (costs|fees)/i, "no hidden costs"],
  [/risk[- ]free/i, "risk free"],
  [/passive income/i, "passive income"],
];

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}

describe("copy standards", () => {
  const root = path.resolve(import.meta.dirname, "../..");
  const files = [...walk(path.join(root, "src")).filter((f) => /\.(ts|tsx)$/.test(f) && !/\.test\./.test(f)), path.join(root, "MODEL_METHODOLOGY.md")];

  it("avoids promises, hype and unsupported claims", () => {
    const hits: string[] = [];
    for (const f of files) {
      const src = fs.readFileSync(f, "utf8");
      for (const [re, label] of BANNED) if (re.test(src)) hits.push(`${path.relative(root, f)}: "${label}"`);
    }
    // this file lists the banned words, so it is excluded above by the .test. filter
    expect(hits).toEqual([]);
  });

  it("never describes a sample property as live, verified or available to buy (negated sentences are fine)", () => {
    const hits: string[] = [];
    const claim = /\b(available (now|to buy|for purchase)|live listings?|verified (listing|property|data))\b/i;
    const negation = /\b(none|not|no|isn't|aren't|can't|never|nothing|invented|sample|mock)\b/i;
    for (const f of files) {
      for (const sentence of fs.readFileSync(f, "utf8").split(/(?<=[.!?])\s+/)) {
        if (claim.test(sentence) && !negation.test(sentence)) hits.push(`${path.relative(root, f)}: ${sentence.trim().slice(0, 80)}`);
      }
    }
    expect(hits).toEqual([]);
  });
});
