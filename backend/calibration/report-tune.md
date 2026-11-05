# Calibration report: tune

Model `openai/gpt-oss-120b`, template `feedback-v5`, 8 essays (0 without valid feedback), raters: developer.
Generated 2026-11-03T14:40:26.843Z.

| Skill | Ratings | Exact | Within 1 | Bias (AI − human) | QWK |
| --- | --- | --- | --- | --- | --- |
| Clear opinion or claim | 4 | 100% | 100% | 0.00 | – |
| Organization | 8 | 63% | 100% | 0.38 | 0.57 |
| Reasons and evidence | 4 | 75% | 100% | -0.25 | 0.75 |
| Sentences | 8 | 88% | 100% | 0.13 | 0.60 |
| Word choice | 8 | 75% | 100% | 0.25 | 0.75 |
| Conventions | 8 | 63% | 100% | 0.13 | 0.57 |
| Story setup | 2 | 50% | 100% | 0.50 | 0.00 |
| Story details | 2 | 50% | 100% | 0.50 | 0.67 |
| Clear topic and focus | 2 | 100% | 100% | 0.00 | 1.00 |
| Facts and explanation | 2 | 100% | 100% | 0.00 | 1.00 |
| **All skills** | 48 | 75% | 100% | 0.17 | 0.73 |

| Band | Ratings | Exact | Within 1 | Bias | QWK |
| --- | --- | --- | --- | --- | --- |
| Grades 3-5 | 24 | 71% | 100% | 0.29 | 0.56 |
| Grades 6-8 | 24 | 79% | 100% | 0.04 | 0.81 |

## Against the proposed gates
- Within one level, all skills: 100% (target ≥ 90%).
- Skills below 90% within one level or with |bias| > 0.3: Organization (100%, bias 0.38); Story setup (100%, bias 0.50); Story details (100%, bias 0.50).

Confusion matrix (rows = human level 1–4, columns = AI level 1–4):

```
1:   1   0   0   0
2:   0  10   7   0
3:   0   1  21   3
4:   0   0   1   4
```

> These essays were rated by the developer, not by independent teachers. Use this to catch obvious drift (for example, leniency), not as evidence of validity.