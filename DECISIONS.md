# DECISIONS.md

## Assumptions Made

**In-Flight Session Config Changes:** The frontend captures the `config_version`
when it first loads the estimator and sends it back as part of the final
`POST /api/estimate` payload. The backend looks up that exact version rather
than whatever's newest, and calculates strictly against it. This means a
homeowner's answers are always evaluated against the same question set and
rates they actually saw — even if Dale edits, retags, or removes an option
partway through their session. I chose version-locking over always-latest
after realizing the alternative has a real failure mode: if Dale removes or
renames an option a homeowner already selected, an always-latest lookup would
either crash or silently miscalculate. Version-locking avoids that entirely.
The tradeoff: if a homeowner leaves the tab open a long time, they get the
price they started with, not Dale's newest rate — which I judged safer than
the alternative given the brief's explicit requirement that editing a price
must never break the live tool mid-flow. If the locked version is ever
missing (e.g. a future cleanup job prunes old config versions), the backend
returns `410 Gone` and the frontend shows a plain message asking the
homeowner to refresh and restart, rather than crashing.

**Owner panel usability:** Config edits are saved as a new versioned document
rather than mutated in place, so there's an implicit version history even
without a dedicated UI for it, and no in-progress edit can corrupt the
currently-live config.

## Calculation Formula

The estimate is a range, not a fixed number, because roofing costs vary with
site conditions a form can't fully capture. The formula:

1. Multiply the roof's square footage by the selected material's price per
   square foot, then add 10% on top to cover waste — offcuts, mismeasurement
   buffer, standard in roofing estimation.
2. Add the tear-off cost: square footage times a rate that depends on how
   many old roofing layers need to come off first (more layers = more labor).
3. Multiply that combined cost by a pitch multiplier (steeper roofs are
   harder and slower to work) and a stories multiplier (taller houses need
   more staging/safety equipment).
4. Add a flat $350 permit fee.
5. That produces a single midpoint estimate. The final low and high numbers
   are that midpoint minus and plus 12%, giving the homeowner a realistic
   range instead of a false-precision single figure.

## What Was Deliberately Not Built

**Full authentication:** The owner panel uses a simple encoded
username:password string as a bearer token rather than a signed, expiring
JWT, and there's no server-side session revocation on logout — logging out
just discards the token client-side. This is acceptable for this exercise
because the brief explicitly states "Basic auth is fine — this is not a
security exercise," and building real session management (refresh tokens,
revocation lists) would have eaten hours better spent on the config engine
and both UIs. For a real production launch, this is the first thing I'd
replace — see Next Steps.

**Token storage in localStorage rather than an httpOnly cookie:** this
carries some XSS exposure risk, which I accepted for the same time-budget
reason. Flagging it here so it's a documented tradeoff, not an oversight.

**Not built at all in this 24-hour window:** CSV export of leads, outbound
webhooks on new-lead capture, a dedicated config version history UI, letting
the owner add entirely new questions (only editing/toggling existing ones is
supported), and automated tests around the calculation engine. All five are
called out as optional stretch goals in the brief, and none of them are
needed for the core flow — estimator → lead capture → owner visibility — to
work end to end. I prioritized finishing that core flow cleanly over
partially building any of these.

**Display-Only Currency Selection:** Added an optional display-currency selector
on the estimate result. Conversion rates are stored in config (owner-editable via
direct DB update, not yet exposed in the admin UI) rather than fetched from a live
exchange-rate API — the business still operates and invoices in USD; the selector
is a convenience for how the number is displayed, not a change to what's actually
quoted or stored on the lead.

## Seed Data Oddities & Handling

Two issues in the seed data:

1. One config value (`pitch` → `medium` → `multiplier`) was given as the
   string `"1.12"` instead of a number, while every other multiplier in the
   same file is a number. I coerce all rate/multiplier fields to `Number()`
   at calculation time rather than trusting the stored type, so this doesn't
   silently break the medium-pitch calculation or produce `NaN`.
2. One historical lead (`ld_0917`) references a config version (1) that
   predates the current schema — it has answers for fields that don't exist
   in the current config at all (`chimney_count`, `gutter_replace`,
   material `slate_natural`). I didn't try to reconcile or migrate this data
   to fit the current schema. Leads store their `answers` as a flexible
   object tied to the `config_version` they were captured under, and I don't
   validate historical leads against the current live config — only new
   submissions get validated against whatever config is live at submit time.
   This reflects how the data actually arrived: as a real export with real
   history, not a clean synthetic dataset.

## Questions for Dale

- Should an estimate be locked in for a set window (e.g. 7 days) once a
  homeowner submits, even if the material rates change afterward — or is a
  live-price-always approach actually what you want, given the goal is
  fast lead qualification rather than a binding quote?
- Marcus will be editing rates directly — do you want any confirmation step
  before a save goes live (e.g. "you're about to change architectural
  shingle from $5.90 to $7.00, confirm?"), or should saves apply instantly?
- Do you want to be notified (email/SMS) the moment a new lead comes in, or
  is checking the panel periodically enough for now?
- Is Columbus, OH your only service area for now, or should the tool
  eventually support multiple regions/currencies?

## Next Steps (If given another week)

Replace the auth scheme with proper signed JWTs (short expiry + refresh
token) and httpOnly cookie storage. Add a real config version history view
so Dale can see what changed and roll back if needed. Add automated tests
around the calculation engine specifically, since that's the one piece a
silent bug in would be costly and hard to notice from the UI alone. Add CSV
export for leads, since that's a low-effort, high-value addition for Marcus.
Consider locking an estimate's price at the moment a homeowner starts the
contact step, if Dale's answer to the pricing question above calls for it.
