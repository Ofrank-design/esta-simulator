# Validating demand for ESTA (roadmap Phase 6)

The goal is to find out who ESTA serves best, and what they actually need, before building accounts, subscriptions or an admin system. This folder is everything needed to run 5 to 10 observed sessions and turn the notes into a decision.

**No session results are included.** Nothing here has been tested with real people yet. The numbers in the documents are model outputs, not research findings.

## Before you start
1. ESTA needs to be somewhere participants can open it: a deployed URL (roadmap Phase 5) or a screen share of a local run. Sessions are far easier with a real URL.
2. Decide the segment (`01-segment-choice.md`). Test one segment at a time.
3. Set up a feedback channel if you want one: see "Feedback link" in the main README.

## The kit, in the order you'll use it
| File | What it's for |
| --- | --- |
| `01-segment-choice.md` | The four segments, a recommendation to confirm or overrule, a screener and an outreach message |
| `02-session-guide.md` | The 45 minute script, the tasks, and the rules for not guiding people |
| `scenario-links.md` | The exact starting links for each task, so every participant starts from the same place |
| `03-comprehension-check.md` | Six questions on the concepts the roadmap names, with answers computed by the model |
| `04-observation-sheet.md` | What to write down live, and the fixed tag vocabulary that makes counting possible |
| `05-consent-and-privacy.md` | Consent wording, recording, and keeping participant data minimal |
| `sessions.template.csv` | One row per participant. Copy it to `sessions.csv` |
| `06-synthesis-and-gate.md` | The repeated evidence rule, the backend gate, and how to choose the next milestone |

## After the sessions
```bash
cp docs/validation/sessions.template.csv docs/validation/sessions.csv   # then add one row per participant
npm run validation:summary
```
This validates every row (and tells you which row and column is wrong), then writes `docs/validation/RESULTS.md` with task completion, concept comprehension, repeated themes, willingness to pay, and the backend gate. It refuses to call a decision on fewer than 5 sessions.

Keep `sessions.csv` out of public repositories if it contains anything that identifies a person. The template uses participant IDs only.
