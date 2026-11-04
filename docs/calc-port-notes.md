# Calculation port notes

`src/calc` is a test-first port of Dan's Python tax library (kept outside the repository). Every calculator is a pure function: it takes its inputs plus a `rates` object for one year and returns every intermediate value.

## Tests

The fixtures in `src/calc/fixtures` come from `reference/harness/generate_fixtures.py`. That folder is git-ignored and holds the private library. There are two kinds of rows:

- `library-test`: the library's own hand-written test cases.
- `generated`: inputs chosen for coverage, with expected values from running the library. They fill gaps: the library has no own tests for 2024 and 2025 (`test_calc2025.py` is a copy of `test_calc2023.py`, and `test_calc2024.py` only covers 2023 classes).

Each row carries its own `rates`, so formulas shared across years are also checked with 2019–2023 data without shipping those years in the app.

| Module | Ported from | Rows |
| --- | --- | --- |
| `osvc-insurance.ts` | `HealthInsuranceOSVCBase`, `SocialInsuranceOSVCBase` | 45 |
| `osvc-income-tax.ts` | `TaxesOSVCBase` (2024+), `TaxSavingProducts2025/2026` | 32 |
| `employee-net-wage.ts` | `NetWageBase` (2021+) | 78 |
| `benefits.ts` | `SickBenefit*`, `SickCare*`, `SalaryCompensation*`, `MaternitySupport*`, `PaternitySupport*` | 330 |

Not ported: yearly advances and over/underpayments, `GrossWage*` (the app finds the gross by bisection over the net wage), the tax-saving estimate, and pensions. Pensions are next.

## Library behaviour to review against the law

These are ported as the library does them, so the tests pass. Each one needs a decision before the app relies on it.

1. **Rounding.** The library was written for Python 2: `round()` takes ties away from zero. The port does the same, and so do Google Sheets.
2. **Year keys are shifted.** `CALC_N` holds employee values for year N but OSVČ settlement values for tax year N−1. The port keys all rates by real tax year.
3. **Union dues.** Deductible only when above 3 000 Kč, and then exactly 3 000. The law caps them at 1.5 % of employment income, max 3 000, so they don't apply to OSVČ income at all.
4. **Donations** are not capped. The law requires at least 2 % of the tax base or 1 000 Kč, and allows at most 15 %.
5. **Child bonus** has no eligibility check (minimum income, minimum bonus). This is PRD known issue 3.
6. **Pension savings threshold.** 16 200 Kč in `TaxSavingProducts2025`, 20 400 Kč in 2026. Since 2024 the law has used 1 700 Kč a month (20 400 a year). Verify.
7. **Employee minimum health premium** stops applying from 2024 in the library. Verify against the law.
8. **Employee solidarity band** compares the gross wage, not the rounded tax base, with the threshold. This makes a difference of a few crowns just below the threshold.
9. **Maternity eligibility** (270 days of insurance in the last two years, voluntary sickness insurance for OSVČ) is not modelled. Only the amounts are.
