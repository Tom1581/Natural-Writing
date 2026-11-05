# Regenerating curriculum standards

`src/learning/content/standards.data.ts` holds verbatim statement texts from four official
curriculum documents. It is generated, never hand-edited. The skill-to-statement mapping lives
in `src/learning/content/frameworks.ts`, and `validateCatalog()` (run by `npm test`) fails if any
mapping points to a statement that is missing.

## Sources (downloaded 2026-11-03)

| Framework | Files | Where |
| --- | --- | --- |
| US Common Core ELA | Writing and Language pages, Kindergarten–Grade 12 (`WK.html`, `W1.html`…`W8.html`, `W9-10.html`, `W11-12.html`, same for `L`) | `https://www.thecorestandards.org/ELA-Literacy/{W,L}/{K,1..8,9-10,11-12}/` |
| Australian Curriculum v9.0 English | `english-curriculum-content-f-6-v9.docx`, `english-curriculum-content-7-10-v9.docx` (Foundation–Year 10) | Links in `FRAMEWORKS` (`frameworks.ts`) |
| Senior Secondary Australian Curriculum: English | "Create a range of texts" descriptions for Units 1, 2 and 4, copied into `gen_standards.py` | `https://v8.australiancurriculum.edu.au/senior-secondary-curriculum/english/english/` |
| Ontario Language (2023), Grades 1–8 | `Expectations_StrandD.pdf`, `Expectations_StrandB.pdf` | Links in `FRAMEWORKS` |
| Ontario English Grade 9 (ENL1W, 2023) | Strand B3 and D statements copied into `gen_standards.py` from `English9PDF.pdf` | Link in `FRAMEWORKS` |
| Ontario English (2007), Grades 10–12 | `english910currb.pdf`, `english1112currb.pdf`; `on2007.py` extracts the ENG2D, ENG3U and ENG4U Writing expectations | Links in `FRAMEWORKS` |
| England National Curriculum | Programme-of-study statements for Year 1, Year 2, Years 3–4, Years 5–6, KS3 and KS4, copied into `gen_standards.py`, plus the 2018 KS2 teacher assessment framework | GOV.UK links in `FRAMEWORKS` |

## Steps

Use a scratch folder outside the repo, and run every script with `python3 -I`.

1. Download the files above into `research/` (CCSS pages into `research/ccss/`).
2. `pip install --target pylib pypdf`
3. Extract the text:
   - `python3 -I pdftext.py pylib research/Expectations_StrandD.pdf > research/on_strandD.txt` (do the same for Strand B, as `on_strandB.txt`)
   - `python3 -I docxtext.py research/english-curriculum-content-f-6-v9.docx > research/acf6.txt` (do the same for 7–10, as `ac710.txt`)
   - `python3 -I ccss.py research/ccss research/ccss.json`
   - `python3 -I pdftext.py pylib research/english910currb.pdf > research/on910.txt` (and `english1112currb.pdf` as `on1112.txt`), then `python3 -I on2007.py research/on910.txt research/on1112.txt research/on2007.json`
4. `python3 -I gen_standards.py research ../../src/learning/content/standards.data.ts`
5. Run `npm test`. Review the diff of `standards.data.ts` before committing.

## Known limits

- Ontario D2.5 (Grade 8) and D2.6 (all grades) are cited by code and title only, because table columns merge in the source PDF. Ontario Strand B vocabulary is cited as "B2 · Vocabulary", because its numbering differs by grade.
- England's programme-of-study statements have no official codes. Each is identified by key stage, section heading and verbatim text.
- Ontario 2007 statements are quoted without the examples and teacher prompts in parentheses. Grades 10–12 use the university-preparation courses (ENG2D, ENG3U, ENG4U). The 2007 Writing strand has no counterclaim statement, so counterclaims are mapped to 1.2 (generating and developing ideas) and 1.5 (reviewing content).
- Reference points, shown with a note on every page: England Years 12–13 have no national curriculum (KS4 is shown); Australian Years 11–12 use the national Senior Secondary descriptions, while states teach their own courses; Ontario's Kindergarten program has no grade-level writing expectations, so Ontario starts at Grade 1.
