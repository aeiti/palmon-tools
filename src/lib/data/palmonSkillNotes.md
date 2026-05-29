# Palmon skill data — open notes

Observations and discrepancies surfaced while transcribing skill data
that don't yet fit into the catalog's data model. The catalog itself
(`palmonSkills.js`, `palmonSkillCosts.js`) stays compact; longer-form
notes live here.

## Star-tier-dependent displayed damage (open)

Two captured Thunderclawd instances show *different* displayed damage at
the same skill levels — strongly suggesting the in-game effect panel
scales with the palmon's star tier in addition to the skill level. Power
totals differ across the two captures, consistent with two separate
instances at different star tiers.

| slot | skill           | L  | instance A (Power 526,180) | instance B (Power 372,820) |
| ---- | --------------- | -- | -------------------------- | -------------------------- |
| 0    | Thunderstrike   | 1  | 93% → 93.96%               | 79.05% → 79.87%            |
| 1    | Dark Cloud      | 1  | 712.5% → 724.82%           | 550% → 559.51%             |
| 2    | Ionized         | 20 | 43.11% → 43.8%             | 38.11% → 38.8%             |

`PALMON_SKILLS.thunderclawd` currently holds instance A's values.

If the hypothesis holds, the same caveat applies retroactively to every
other SSR/UR entry — every captured number is implicitly tagged with the
instance's star tier at capture time. Resolving this likely needs an
`effectValues[level][starTier]` shape (or equivalent) plus re-capturing
key entries with the star tier recorded.
