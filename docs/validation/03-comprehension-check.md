# 3. Comprehension check

The roadmap asks you to observe whether people understand occupancy, operating expenses, gross yield, appreciation, inflation and reinvestment. Ask these six questions with the simulator open on Marina Residence at its defaults (`<SITE>/simulator/marina-residence`). Don't help. Let them use the screen if they want to.

Score each answer 1 (correct), 0.5 (partly) or 0 (wrong or can't say). Leave blank if you didn't ask. The column names are for `sessions.csv`.

| Column | Ask | Correct answer (1 point) | Half a point |
| --- | --- | --- | --- |
| `comp_occupancy` | "If the property is rented 70% of the time instead of 92%, does the first year income after costs go up, down or stay the same? About how much?" | Down. Roughly a quarter lower ($21,652 to $16,396, down 24%). Any answer between about 20% and 30% counts | Says down but can't size it, or only says "less" |
| `comp_opex` | "What do operating expenses mean here? What are they a share of?" | Running costs such as management and insurance, taken as a share of the rent collected (not of the property's value) | Says costs, but thinks they are a share of the property's value or the investment |
| `comp_gross_vs_net` | "The page shows a 6.5% gross yield, but the net cash yield says 4.42%. Why aren't they the same?" | Gross is before empty periods, running costs and maintenance. Net is what's left after them | Says "fees" or "costs" without mentioning empty periods |
| `comp_appreciation` | "The property appreciates 3% a year. Is that money in your pocket each year?" | No. It is a change in the property's value, and it only becomes profit if sold | Says it isn't cash but can't say why it matters |
| `comp_inflation` | "What's the difference between 'Total value before sale costs' and 'Total value in today's money'?" | The second is the first adjusted for inflation, so it shows what the money could buy today. The first is in future dollars | Knows one is smaller but not why |
| `comp_reinvest` | "Switch to 'Reinvested'. Where does the income go now, and what happens to your ownership share?" | It buys more of the property, so ownership grows (up to 100%), and no cash is paid to you | Says income isn't paid out but doesn't link it to ownership growing |

Note, for each question, what words they used. When people consistently give the "half point" answer, the label or explanation is the thing to fix. When a concept scores badly across several people, that is repeated evidence. One person misreading something is not.

Two optional follow ups, if time:
- "In your own words, what is a capital call?" (Correct: extra money you'd have to put in when the property's income doesn't cover its costs.)
- "What does 'initial ownership share' mean?" (Correct: your investment divided by the property's value.)
