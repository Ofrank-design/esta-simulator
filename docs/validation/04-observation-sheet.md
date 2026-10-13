# 4. Observation sheet and tag vocabulary

Use the same words every time so the summary can count them. The script treats a tag outside these lists as "other" and tells you.

## While they work (per task)
- Start and stop time, in seconds
- Result: `done`, `partial`, `failed` or `skipped`
- Help requests (count of times you stepped in)
- The path they took (what they clicked, in order)
- Silent pauses over 10 seconds, and what was on screen
- Clicks that did nothing, or things they expected that weren't there
- Verbatim quotes, in quotation marks

## Tag vocabulary (separate several with a semicolon)

**Distrust**: where they didn't believe a number (`tags_distrust`)
`mock_data`, `yield_too_high`, `no_source`, `ignores_fees`, `ignores_tax`, `unrealistic_growth`, `too_precise`, `other`

**Needs explaining**: what they wanted explained (`tags_explain`)
`occupancy`, `opex`, `gross_vs_net`, `appreciation`, `inflation`, `reinvest`, `capital_call`, `ownership_share`, `roi`, `other`

**Wants to share**: what they'd send to someone (`tags_share`)
`link`, `pdf`, `csv`, `screenshot`, `slides`, `email`, `other`

**Blockers**: what would stop them using it again (`tags_blockers`)
`no_branding`, `cant_save`, `own_properties`, `needs_login`, `needs_team`, `needs_integration`, `not_my_workflow`, `trust`, `other`

## Rating the gate needs (`need_*` columns)
| Need | Ask yourself |
| --- | --- |
| `need_cross_device` | Did they say they'd have to start again on another device, and that it's a real problem? |
| `need_team_sharing` | Do others in their team need to see or edit the same scenarios or data? |
| `need_controlled_property_data` | Must it use their own verified listings or project data, kept consistent across users? |
| `need_identity` | Must it know who someone is, such as per client, per agent or for permissions? |

`none` is no need. `nice` is a preference. `must` is something they cannot do their job without, ideally with a real example from last month. When in doubt, choose `nice`: the gate should be hard to open on enthusiasm.

## Row checklist (after every session)
- [ ] `participant_id` is an ID, not a name
- [ ] Segment and how they were recruited
- [ ] All seven tasks have a result (`skipped` if you didn't reach them)
- [ ] Comprehension scores filled in for the questions you asked
- [ ] Tags use the vocabulary above
- [ ] Willingness to pay rated from behaviour, not enthusiasm
- [ ] Three verbatim quotes in `quotes`
