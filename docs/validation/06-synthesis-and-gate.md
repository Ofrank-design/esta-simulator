# 6. Synthesis and the backend gate

## Run it
```bash
npm run validation:summary
```
Read `docs/validation/RESULTS.md` first, then the quotes. The numbers tell you what to look at. The quotes tell you why.

## The rule for repeated evidence
The roadmap says to prioritise repeated evidence over one person's request. In this kit, a pattern counts as repeated when at least **3 participants**, or **40% of them** if that is more, show it. With 5 to 7 sessions that means 3. With 10 it means 4.

- One person asking for a feature is a lead. Ask the next person about it.
- Two is a coincidence. Three of five is a pattern.
- Fewer than 5 sessions is too few to decide anything. The script says so and won't open the gate.

## The gate
> Do not build the SaaS backend until at least one important need depends on persistent cross device state, shared team data, controlled property data, or user identity.

The script opens the gate for a need only when **at least the repeated threshold of participants** rated it **must have** (not nice to have), and there were at least 5 sessions. It then says which need it is. A backend is justified for that need and no wider.

Examples:
- Four of six advisers say they must be able to reopen a client's scenario next week on a different laptop: that is `cross_device`, and the smallest thing that solves it may be saved scenario links, not accounts.
- Three of six say the team must use the same set of their own listings: that is `controlled_property_data` and `team_sharing`. This needs a real data design, review and approval process before it needs code.
- Everyone loves the report and nobody needs to save anything: the gate stays shut and the right investment is better exports.

## Choosing the next milestone
The roadmap asks whether the next step is a white label B2B calculator or a user account experience. The summary shows counts for each as signals:

| Signals toward a white label calculator | Signals toward user accounts |
| --- | --- |
| Willing to pay for branding, editable assumptions, downloadable reports | Must have: cross device, identity, team sharing; wants saved scenarios |
| Blockers: `no_branding`, `own_properties` | Blockers: `cant_save`, `needs_login`, `needs_team` |
| Shares outputs outside the tool (pdf, slides, email) | Returns to the same scenarios over time |

Read them as evidence for a conversation, not a verdict. If both are weak, the answer may be that the problem isn't worth building for this segment, which is a valid and useful result.

## What to do about confusion
Comprehension scores below about 70% on a concept, repeated across participants, are a copy or design problem. Fix the label, the helper text or the methodology, then check with the next participants. Don't fix something one person misread.

## Decision record (write this down)
Copy this into a note after the last session:

```
Segment tested:
Participants (n), and how recruited:
What the data shows (3 bullets, with counts):
Repeated confusion to fix:
Backend gate: met for [need] / not met / not enough sessions
Next milestone: white label calculator / accounts / improve exports / stop
The evidence for that choice (quotes):
What would change my mind:
Date, and who agreed:
```

## What this kit can't tell you
- Whether people would really pay. Past behaviour is stronger evidence than enthusiasm, and a number from a polite conversation is still a guess.
- Anything about segments you didn't test.
- Whether a genuine fractional investment platform is feasible. That is the separate project in roadmap Phase 8 and needs legal, tax and financial professionals.
