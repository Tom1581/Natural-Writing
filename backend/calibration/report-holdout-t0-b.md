# Calibration report: holdout

Model `openai/gpt-oss-120b`, template `feedback-v6`, 8 essays (1 without valid feedback), raters: developer.
Generated 2026-11-04T02:24:20.627Z.

| Skill | Ratings | Exact | Within 1 | Bias (AI − human) | QWK |
| --- | --- | --- | --- | --- | --- |
| Clear opinion or claim | 2 | 0% | 100% | 0.00 | -1.00 |
| Organization | 7 | 71% | 100% | 0.29 | 0.80 |
| Reasons and evidence | 2 | 100% | 100% | 0.00 | 1.00 |
| Sentences | 7 | 71% | 100% | 0.00 | 0.30 |
| Word choice | 7 | 86% | 100% | 0.14 | 0.88 |
| Conventions | 7 | 86% | 100% | 0.14 | 0.70 |
| Clear topic and focus | 3 | 67% | 100% | 0.33 | 0.40 |
| Facts and explanation | 3 | 100% | 100% | 0.00 | – |
| Story setup | 2 | 100% | 100% | 0.00 | 1.00 |
| Story details | 2 | 100% | 100% | 0.00 | – |
| **All skills** | 42 | 79% | 100% | 0.12 | 0.80 |

| Band | Ratings | Exact | Within 1 | Bias | QWK |
| --- | --- | --- | --- | --- | --- |
| Grades 3-5 | 24 | 71% | 100% | 0.21 | 0.81 |
| Grades 6-8 | 18 | 89% | 100% | 0.00 | 0.78 |

## Against the proposed gates
- Within one level, all skills: 100% (target ≥ 90%).
- Skills below 90% within one level or with |bias| > 0.3: Clear topic and focus (100%, bias 0.33).

Confusion matrix (rows = human level 1–4, columns = AI level 1–4):

```
1:   0   1   0   0
2:   0   6   2   0
3:   0   0  16   4
4:   0   0   2  11
```

> These essays were rated by the developer, not by independent teachers. Use this to catch obvious drift (for example, leniency), not as evidence of validity.