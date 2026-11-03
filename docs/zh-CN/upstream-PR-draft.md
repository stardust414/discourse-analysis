# Draft PR: Add lightweight i18n and Simplified Chinese localization

Draft only. No PR or public release has been created.

## Summary

Discourse Analysis 3.3.1 currently exposes English UI strings across HTML, dynamic menus, dialogs and desktop menus. This change adds a small display-only i18n layer and a reviewed Simplified Chinese catalog while retaining the existing HTML/CSS/classic JavaScript architecture and dependencies.

- English remains the complete baseline and default fallback. The initial preference is Follow System; supported Simplified Chinese system locales resolve to zh-CN, and unsupported locales resolve to English.
- Adds English / 简体中文 / Follow System settings, immediate switching and a local-only language preference.
- Covers static bindings, dynamic sentence templates, tooltips, placeholders, ARIA labels, recovery UI and Electron menu labels without replacing user content or executing interpolated HTML.
- Does not change project schema, saved language fields, relationship IDs or profile IDs. Preserves all five notation profiles, their mappings, dominance rules, colors, symbols, stars and original abbreviations.
- Adds Chinese / English / abbreviation / keyword relationship search, with IME composition protection. Custom profiles and user-renamed relationships remain verbatim.
- Provides bilingual learning information. Compact choices prioritize the current profile's exact abbreviation when space is constrained; full names remain available in the Guide, tooltips and focus details.
- Adds an automated i18n audit and regression tests, plus bounded dialogs, dark-theme form styling and focused accessibility/layout fixes.
- Corrects the inaccurate “Double-click to split” import message in both languages: verified ordinary editing behavior selects a word on double-click and splits at the cursor with Enter. Splitting/merging behavior is unchanged.
- Clarifies the existing parallel-column rule: a verse loads into its first row; continuation cells initially remain empty and editable. The distribution algorithm is unchanged.

## Scope and validation

Base: upstream `98da0241c38eef936be0f06cf736aa607dda0b62` (3.3.1). The application version remains 3.3.1; this is a localization, not an upstream version bump or rebrand.

- `npm run check`: lint and typecheck pass; **343/343 unit tests**, including the original 275.
- Full Playwright suite: **107/107**, including the original 30 English scenarios.
- i18n audit: **600 English / 600 Chinese keys**, no intentional production translation gaps.
- Stage 5 packaged Mac arm64 validation: **20/20 workflow checks and 30/30 window/zoom/theme combinations**; browser layout matrix covers 40 combinations.
- Final handoff repeats full regression and runs smoke/data-compatibility checks from the final ZIP. Exact final source commit, ZIP hash and results are recorded in the linked final verification report.

See [final verification](最终验证报告.md), [i18n implementation notes](../i18n.md) and [maintenance workflow](维护与上游同步.md).

No Electron or dependency upgrades. The original word-internal split/merge spacing behavior remains. No claim of full Windows hardware validation is made. The Mac build has no valid Developer ID signature and is not Apple-notarized. Chinese terminology reflects project-specific human review, not official translations endorsed by the notation authors. This draft does not imply upstream approval.

Original product identity, copyright notices, Scripture-source credits and notation attribution are retained.
