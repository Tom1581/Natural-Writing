# Humanizer quality tests (2026-10-05)

Three ChatGPT-style documents (written by OpenAI's gpt-oss-120b) were run through the Natural Quill pipeline and checked for meaning, grammar, and AI-detector scores. Paste any pair from `samples/` into https://gptzero.me to compare with GPTZero yourself.

## Samples

| File | What it is |
|---|---|
| `1-research-paper-ORIGINAL-chatgpt.txt` / `-REWRITE-academic.txt` | 1,810-word APA paper with statistics, a table, and references |
| `2-essay-ORIGINAL-chatgpt.txt` / `-REWRITE-default.txt` | 683-word argumentative essay, default settings |
| `3-stem-review-ORIGINAL-chatgpt.txt` / `-REWRITE.txt` | IEEE-style literature review (6 of 15 paragraphs were left unchanged because the free API quota ran out) |

## Results

| Check | Research paper | Essay | STEM review |
|---|---|---|---|
| Structure, citations, statistics, references kept | Yes | Yes | Yes |
| LanguageTool grammar errors in the rewrite | 0 | 0 | 0 |
| LanguageTool style notes in the rewrite | 1 (the quoted scale label "all of the time") | 0 | 3 ("multi-task" could be "multitask") |
| Independent LLM grade, academic quality (orig → rewrite) | 9 → 9 | | |
| Independent LLM grade, naturalness (orig → rewrite) | 5 → 9 | | |
| AI detectors, original (fakespot / desklib) | 0.81 / 0.90 | 1.00 / 1.00 | 0.54 / 0.31 |
| AI detectors, rewrite (fakespot / desklib) | 0.84 / 0.88 | 0.97 / 0.99 | 0.44 / 0.15 |
| Human-written papers from 2017–2019, for comparison | 0.15–0.34 / 0.00–0.33 | | |

LanguageTool spelling flags on author names and technical terms (Koopmans, IWPQ, EfficientNet) are not counted; they appear in originals and rewrites alike.

## Conclusion

- The rewrites are faithful and grammatically clean, and they read more naturally.
- They are still classified as AI by both open-source detectors. Six rewriting strategies were tested on the same 8 paragraphs (three model families, higher temperature, human style examples); none produced a paragraph that both detectors judged human, while real human paragraphs passed 12 of 16 times.
- GPTZero was not tested directly (its API is paid). Expect a similar result: it is trained specifically on paraphrased and "humanized" AI text.

## Running the scripts

- `scripts/detect.py`: needs Python with `torch`, `transformers>=4.48`, and `sentencepiece`; downloads the two detector models (about 2 GB) on first run. `python scripts/detect.py samples/*.txt`
- `scripts/grammar.mjs`: LanguageTool public API (free, rate-limited). `node scripts/grammar.mjs samples/*.txt`
- `scripts/gptzero.mjs`: GPTZero's official API; set `GPTZERO_API_KEY` first.

Detector calibration used English, open-access PubMed Central articles published 2017–2019 (for example PMC7338696), before ChatGPT existed.

## Free alternatives tested (2026-10-05, same 8 test paragraphs)

### Free open-source humanizer models (Apache-2.0, run locally with llama.cpp)

| Model | Judged human by both detectors | Fakespot / Desklib (avg) | Passed citation, number, and length checks | Grammar and style issues (LanguageTool) | Other problems seen |
|---|---|---|---|---|---|
| Natural Quill pipeline (gpt-oss-120b) | 0 / 8 | 0.97 / 0.70 | 8 / 8 | 1 | none |
| GoHumanize Open Humanizer (Qwen3-4B) | 0 / 8 | 0.95 / 0.77 | 8 / 8 | 1 | made cited claims stronger ("can improve" became "improves"), invented a heading, kept "Overall," |
| jialinyyzz/humanizer (Gemma 4 12B, Q4_K_M) | 0 / 8 | 0.95 / 0.75 | 5 / 8 | 5, plus missing articles and a sentence fragment that LanguageTool did not flag | broke a citation ("(Mann, & Holdsworth, 2003)"), padded text, added "In summary" and "Furthermore" |
| Real human paragraphs (2017–2019) | 12 / 16 | 0.18 / 0.23 | n/a | n/a | n/a |

The only rewrites that scored noticeably lower were ones with grammar mistakes or a casual tone, and they still did not pass.

### Free hosted options

- Free "AI humanizer" sites (HumanTone, TextToHuman, and others) are websites, not APIs; their bypass rates come from affiliate reviews, and calling them from a backend would break their terms of service.
- Free LLM APIs are sized for development. Cerebras (about 1M tokens a day, no card) is the best fit for overflow and can be plugged in through `EXTRA_LLM_BASE_URL`, `EXTRA_LLM_MODEL`, and `EXTRA_LLM_API_KEY`. Mistral's free tier requires opting in to training on your data, and Cohere's is non-commercial, so neither suits user papers. Text from these models is detected the same way.
