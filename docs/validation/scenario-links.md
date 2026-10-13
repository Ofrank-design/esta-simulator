# Scenario links for each task

Replace `<SITE>` with your deployed address (or the address you're screen sharing). These were generated with the app's own link builders, so the assumptions in each link are exact. Open each in a fresh tab before the participant starts.

| Task | Start from | Link |
| --- | --- | --- |
| T1 | The home page | `<SITE>/` |
| T2 | Marina Residence, $5,000 | `<SITE>/simulator/marina-residence?v=2&investment=5000` |
| T3 | Marina Residence, $5,000, 75% occupancy (what they should have after T2) | `<SITE>/simulator/marina-residence?v=2&investment=5000&occupancy=75` |
| T4 | The compare page for that scenario | `<SITE>/compare?property=marina-residence&v=2&investment=5000&occupancy=75` |
| T5 | Marina Residence, $5,000, 75% occupancy | `<SITE>/simulator/marina-residence?v=2&investment=5000&occupancy=75` |
| T6 | Marina Residence, defaults | `<SITE>/simulator/marina-residence` |
| T7 | Marina Residence, $5,000, reinvested | `<SITE>/simulator/marina-residence?v=2&investment=5000&distributions=reinvest` |

For T2, T3 and T5, if a participant didn't reach the expected state themselves, load the link for them and record that they needed help.

## What you should see (model outputs, to check the participant's reading against)
Marina Residence, default assumptions:
- Year 1 property income after costs: **$21,652**. Net cash yield **4.42%** against a gross yield of **6.5%**.
- At 75% occupancy, year 1 income falls to **$17,591** (down 18.8%) and net cash yield falls to **3.59%**.
- At 70% occupancy, year 1 income falls to **$16,396** (down 24.3%).
- Reinvested at $2,500, ownership grows from 0.5102% to **0.7767%** over ten years and no cash is paid out (that is the default $2,500 investment).
