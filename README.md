# saucedemo E2E suite

UI end-to-end tests for [saucedemo.com](https://www.saucedemo.com), Sauce Labs'
public demo shop. Playwright and TypeScript, page objects, tiered cross-browser
runs, and a written bug report for the defects the site ships on purpose.

**38 tests, 38 passing** on Chromium in 19.9 seconds.

```
38 passed (19.9s)
```

## Running it

```bash
npm install
npx playwright install chromium          # add firefox webkit for the full matrix
npm run test:chromium                    # everything, one engine
npm test                                 # full matrix, three engines
npm run test:defects                     # just the problem_user findings
npm run report
```

## What is covered

| Spec | Test IDs | Focus |
|---|---|---|
| `01-login.spec.ts` | `TC-LOGIN-01` to `08` | valid login, locked-out account, wrong password, unknown user, empty fields, field masking |
| `02-inventory.spec.ts` | `TC-INV-01` to `09` | catalogue integrity, four sort orders, cart badge arithmetic |
| `03-cart.spec.ts` | `TC-CART-01` to `04` | add, remove, state across navigation, empty cart |
| `04-checkout.spec.ts` | `TC-CO-01` to `06` | happy path, three required-field cases, total arithmetic |
| `05-problem-user-defects.spec.ts` | `BUG-SD-001` to `004` | characterisation of the intentional defects |
| `06-session-guard.spec.ts` | `TC-SESS-01` to `03` | direct-URL access, logout invalidation, cookie scope |

Findings are in [`docs/BUG-REPORT.md`](docs/BUG-REPORT.md).

## Four decisions worth explaining

**Cross-browser is tiered, not uniform.**
Chromium runs all 38. Firefox and WebKit run only login, checkout, and the
session guard. Running every feature test on every engine triples the runtime
and adds almost no signal once the core flows are confirmed to work
cross-engine. The tier is declared in `playwright.config.ts` so the choice is
visible rather than accidental.

**One login per run, not one per test.**
`tests/setup/auth.setup.ts` signs in once and saves the session to
`storageState`. Specs that need a session reuse it. Besides the time saved, an
auth outage then produces one clear failure instead of thirty confusing ones.
The specs that test login itself explicitly opt out with an empty
`storageState`.

**Money is asserted arithmetically.**
`TC-CO-05` checks that total equals subtotal plus tax. `TC-CO-06` checks the
subtotal against the sum of the catalogue prices it read beforehand. Neither
hardcodes a figure, so a price change does not break the test while a broken
total still does.

**Known defects are characterisation tests, not failures.**
The `problem_user` specs assert the behaviour that is actually there. That keeps
the suite green and puts the defects in a report a human can read. It also means
each test fails on the day the bug is fixed, which is exactly when the report
needs updating. A permanently red suite is a suite nobody looks at.

## Honest scope

- Sort assertions use `localeCompare`, which matches how the site orders names.
  A different collation would need the expectation adjusted, not the test rewritten.
- `BUG-SD-004` asserts only that the slow account takes over 2 seconds. The
  precise figure is logged and quoted in the report rather than being frozen
  into a threshold, because timing on a shared host is not stable enough to
  assert tightly.
- Visual regression is not covered. `visual_user` exists on the site and its
  defects are pixel-level, which needs screenshot baselines and a decision about
  where to store them. Out of scope here rather than done badly.
