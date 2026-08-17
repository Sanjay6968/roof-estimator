# DECISIONS.md

## Assumptions Made
*   **In-Flight Session Config Changes:** 
    *   *Prompt for Dale/Reviewer:* When the owner edits and saves a new config rate while a homeowner is mid-way through the estimator wizard, does that homeowner's in-flight session get the old price or the new price when they submit? 
    *   *[Leave empty for you to fill in how you handled this]*

## Calculation Formula
*[Leave empty for you to fill in your plain-language explanation of the pricing formula]*

## What Was Deliberately Not Built
*   **Real Authentication:** 
    *   *Prompt for Dale/Reviewer:* The owner panel uses a simple base64 encoded string of the username and password as a "token", without JWT signing, expiration, or server-side revocation on logout. 
    *   *[Leave empty for you to fill in your rationale for this scope cut]*
*   **Secure Token Storage:**
    *   *Prompt for Dale/Reviewer:* The frontend stores this token in `localStorage`, which carries XSS exposure risks, rather than a secure, HttpOnly cookie.
    *   *[Leave empty for you to fill in your rationale for this scope cut]*
*[Leave empty for you to fill in any other items skipped]*

## Seed Data Oddities & Handling
*[Leave empty for you to explain how you handled things like string multipliers or historical lead structures]*

## Questions for Dale
*[Leave empty for you to add your questions before a production launch]*

## Next Steps (If given another week)
*[Leave empty for you to fill in future plans]*
