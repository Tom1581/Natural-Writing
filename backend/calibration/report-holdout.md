# Calibration report: holdout

Model `openai/gpt-oss-120b`, template `feedback-v6`, 8 essays (1 without valid feedback), raters: developer.
Generated 2026-11-03T14:54:43.201Z.

| Skill | Ratings | Exact | Within 1 | Bias (AI − human) | QWK |
| --- | --- | --- | --- | --- | --- |
| Clear opinion or claim | 2 | 0% | 100% | 0.00 | -1.00 |
| Organization | 7 | 71% | 100% | 0.29 | 0.80 |
| Reasons and evidence | 2 | 100% | 100% | 0.00 | 1.00 |
| Sentences | 7 | 57% | 100% | -0.14 | -0.24 |
| Word choice | 7 | 57% | 100% | -0.14 | 0.67 |
| Conventions | 7 | 57% | 100% | 0.43 | 0.28 |
| Clear topic and focus | 3 | 67% | 100% | 0.33 | 0.40 |
| Facts and explanation | 3 | 100% | 100% | 0.00 | – |
| Story setup | 2 | 100% | 100% | 0.00 | 1.00 |
| Story details | 2 | 50% | 100% | -0.50 | 0.00 |
| **All skills** | 42 | 64% | 100% | 0.07 | 0.67 |

| Band | Ratings | Exact | Within 1 | Bias | QWK |
| --- | --- | --- | --- | --- | --- |
| Grades 3-5 | 24 | 63% | 100% | 0.21 | 0.76 |
| Grades 6-8 | 18 | 67% | 100% | -0.11 | 0.38 |

## Against the proposed gates
- Within one level, all skills: 100% (target ≥ 90%).
- Skills below 90% within one level or with |bias| > 0.3: Conventions (100%, bias 0.43); Clear topic and focus (100%, bias 0.33); Story details (100%, bias -0.50).

Confusion matrix (rows = human level 1–4, columns = AI level 1–4):

```
1:   0   1   0   0
2:   0   6   2   0
3:   0   1  13   6
4:   0   0   5   8
```

> These essays were rated by the developer, not by independent teachers. Use this to catch obvious drift (for example, leniency), not as evidence of validity.