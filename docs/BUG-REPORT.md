# Findings: saucedemo.com

**Target:** `https://www.saucedemo.com`
**Date:** 2026-11-08
**Method:** Playwright UI automation, 38 tests, all passing on Chromium
**Summary:** 1 High, 2 Medium, 1 Low, 1 contract finding, 2 positive observations.

Sauce Labs ships these defects deliberately so that automation can be practised
against a target with known faults. They are reported here the way real defects
would be: what was observed, the impact, and a severity that can be defended.

Every finding has a test ID that reproduces it.

---

## BUG-SD-003 | `problem_user` cannot complete checkout: the last name field rejects input

**Severity:** High · **Account:** `problem_user`
**Reproduced by:** `BUG-SD-003` in `05-problem-user-defects.spec.ts`

### Steps
1. Sign in as `problem_user`.
2. Add any product to the cart and open the cart.
3. Click Checkout.
4. Type into First Name. The value is accepted.
5. Type into Last Name.

### Expected
The field holds the typed value, and Continue advances to the summary.

### Actual
The field reads back empty. `expect(co.lastName).toHaveValue('')` passes.
Because Last Name is a required field, its validation can never be satisfied,
Continue always errors, and the order cannot be placed.

### Impact
Total loss of checkout for every user in this state. This is the only finding
here rated High, because it is the only one that removes the product's purpose
rather than degrading it. A broken image is embarrassing; an unreachable order
button stops revenue.

---

## BUG-SD-002 | `problem_user`: sorting accepts the selection and does nothing

**Severity:** Medium · **Account:** `problem_user`
**Reproduced by:** `BUG-SD-002`

Selecting "Name (Z to A)" leaves the catalogue in its original order. The
control reports success: the dropdown shows the new selection, no error appears,
and the page does not reload into an error state.

### Expected
Six products reordered descending by name.

### Actual
Order is byte-identical to before the sort. Asserted both ways: the list equals
what it was, and it does not equal the correctly sorted list.

### Impact
Medium rather than Low because the failure is silent. A control that visibly
breaks gets reported by users. A control that accepts input and quietly ignores
it leaves the user believing they are looking at sorted data, which is worse
than an error message.

---

## BUG-SD-001 | `problem_user`: all six products share one image

**Severity:** Medium · **Account:** `problem_user`
**Reproduced by:** `BUG-SD-001`

All six `img` elements in the catalogue resolve to a single distinct `src`.
Verified by collecting the sources and asserting the distinct count is 1 rather
than 6.

### Expected
Six distinct product images.

### Actual
One source, repeated six times.

### Impact
Customers cannot tell the products apart visually, so the wrong item gets
ordered. Medium: the flow still works, but it misinforms the purchase decision.

---

## BUG-SD-004 | `performance_glitch_user`: login is roughly four times slower

**Severity:** Low · **Account:** `performance_glitch_user`
**Reproduced by:** `BUG-SD-004`

### Measured
| Account | Time from submit to catalogue rendered |
|---|---|
| `standard_user` | about 1,200 ms |
| `performance_glitch_user` | **5,175 ms** |

Figure taken from the test run on 2026-11-08 and logged to stdout by the test
rather than hardcoded.

### Impact
Low. The flow completes and nothing is wrong with the result. Worth reporting
because a five second sign-in is past the point where users start retrying,
and a retry on an auth endpoint is how duplicate-session bugs get discovered.

### Note on the assertion
The test asserts only `> 2000 ms`. Pinning it to 5,175 would make the test fail
whenever the shared host had a good day, which would be flake reported as a
defect. The number belongs in the report; the loose bound belongs in the test.

---

## FINDING-SD-001 | Checkout is reachable from an empty cart

**Severity:** Low (contract) · **Account:** `standard_user`
**Reproduced by:** `TC-CART-04`

With zero items in the cart, the Checkout button is still rendered and enabled.

### Expected
The button is hidden or disabled, or the step refuses to advance.

### Actual
The button is visible. `TC-CART-04` asserts the real behaviour and points here,
rather than asserting the preferred behaviour and going red.

### Impact
Low on a demo. On a real store it is the entry point to an order with no lines,
which downstream fulfilment and invoicing usually cannot represent.

---

## OBS-SD-001 | Login gives no username-enumeration oracle

**Severity:** Info (positive)
**Reproduced by:** `TC-LOGIN-03`, `TC-LOGIN-04`

A wrong password and a username that does not exist produce the same message:
`Username and password do not match any user in this service`. An attacker
cannot use the login form to learn which accounts exist.

Recorded on purpose. This is the property a later "more helpful error message"
change would quietly remove, and the test is what would catch that.

---

## OBS-SD-002 | Page-level access control holds

**Severity:** Info (positive)
**Reproduced by:** `TC-SESS-01`, `TC-SESS-02`, `TC-SESS-03`

- Four protected paths (`/inventory.html`, `/cart.html`, `/checkout-step-one.html`,
  `/checkout-step-two.html`) all refuse to render their content without a session.
- After logout, navigating directly back to `/inventory.html` does not restore
  access, so the session is genuinely invalidated rather than merely hidden.
- The `session-username` cookie is scoped to `saucedemo.com`.

---

## Not tested, and why

| Area | Reason |
|---|---|
| Visual regression (`visual_user`) | Needs screenshot baselines and a policy on where they live; out of scope rather than done badly |
| `error_user` failure modes | Behaviour is inconsistent between runs, so assertions would be flake, not findings |
| Rate limiting on login | Shared public demo; hammering it would affect other users |
| Accessibility audit | Deserves its own pass with an axe-based run, not a few spot assertions |
