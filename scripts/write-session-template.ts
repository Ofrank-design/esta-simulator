import fs from "node:fs";
import path from "node:path";
import { SESSION_COLUMNS } from "../src/lib/validation/schema";

const target = path.resolve(import.meta.dirname, "..", "docs/validation/sessions.template.csv");
fs.writeFileSync(target, SESSION_COLUMNS.join(",") + "\n");
console.log(`Wrote ${path.relative(process.cwd(), target)}`);
