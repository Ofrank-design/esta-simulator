import fs from "node:fs";
import path from "node:path";
import { buildMethodologyMarkdown } from "../src/lib/methodology";

const target = path.resolve(import.meta.dirname, "..", "MODEL_METHODOLOGY.md");
fs.writeFileSync(target, buildMethodologyMarkdown());
console.log(`Wrote ${path.relative(process.cwd(), target)}`);
