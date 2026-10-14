// Starts the production server, requests every public route, and fails on a bad status OR any error in the
// server's own log. Browser tests can pass while the server quietly logs errors, so this checks both.
import { spawn } from "node:child_process";

const port = process.env.CHECK_PORT || "3500";
const base = `http://127.0.0.1:${port}`;
const ids = ["marina-residence", "business-district-tower", "palm-garden-villas", "creek-harbour-offices", "al-barsha-apartments", "jvc-residences"];
const routes = [
  ["/", 200], ["/compare", 200], ["/compare?property=creek-harbour-offices&v=2&investment=4000&occupancy=80", 200],
  ["/methodology", 200], ["/privacy", 200], ["/robots.txt", 200], ["/sitemap.xml", 200],
  ...ids.flatMap((id) => [[`/simulator/${id}`, 200], [`/simulator/${id}?v=2&investment=5000&occupancy=70&distributions=reinvest`, 200], [`/simulator/${id}/report?occupancy=60`, 200]]),
  ["/simulator/not-a-property", 404], ["/nope", 404],
];

// Run Next directly (not through npx) so stopping this process really stops the server.
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", port], { stdio: ["ignore", "pipe", "pipe"], env: process.env });
const hardStop = setTimeout(() => { console.error("FAILED: timed out after 120 seconds"); server.kill("SIGKILL"); process.exit(1); }, 120_000);
let log = "";
server.stdout.on("data", (d) => (log += d));
server.stderr.on("data", (d) => (log += d));

const stop = () => { clearTimeout(hardStop); server.kill("SIGKILL"); };
const fail = (msg) => { console.error(`\nFAILED: ${msg}\n--- server log ---\n${log}`); stop(); process.exit(1); };

for (let i = 0; i < 60; i++) {
  try { if ((await fetch(base)).status === 200) break; } catch {}
  if (i === 59) fail("server didn't start");
  await new Promise((r) => setTimeout(r, 1000));
}

const problems = [];
for (const [path, want] of routes) {
  const res = await fetch(base + path, { redirect: "manual" });
  if (res.status !== want) problems.push(`${path}: expected ${want}, got ${res.status}`);
}
await new Promise((r) => setTimeout(r, 500));
if (/error|unhandled|warn/i.test(log.replace(/Ready in|Local:|Network:/g, ""))) problems.push("the server logged an error or warning");
if (problems.length) fail(problems.join("\n"));
console.log(`OK: ${routes.length} routes served as expected, and the server log is clean.`);
stop();
process.exit(0);
