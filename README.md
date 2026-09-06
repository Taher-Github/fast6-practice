# Grade 6 Florida FAST PM1 Mathematics Practice System

Everything here is built against the FLDOE **Test Design Summary and Blueprint: FAST
Mathematics and B.E.S.T. EOCs** (updated February 5, 2025) and the Florida B.E.S.T. Grade 6
benchmark texts, checked against fldoe.org and flfast.org before any item was written.

Blueprint used (Grade 6, verified):

| Reporting category | Official % | Items per 38-item form here | % here |
|---|---|---|---|
| Number Sense and Operations | 33–42% | 15 | 39.5% |
| Algebraic Reasoning | 25–36% | 12 | 31.6% |
| Geometric Reasoning, Data Analysis, and Probability | 25–36% | 11 | 28.9% |

Calculator: four-function, on Number Sense and Operations items only.
Reference sheet: Grade 6 B.E.S.T. sheet (conversions + V = lwh) — on screen in the app and on
the last page of every question paper.

## Files

| File | What it is |
|---|---|
| `questions.json` | 532 items (14 forms × 38), the full bank |
| `index.html` | The test app — one self-contained file, no build step, no CDN |
| `verification_report.txt` | Per-benchmark pass/fail from the verifier |
| `pdfs/Test_N_Questions.pdf` | Printable question paper, 14 of them |
| `pdfs/Test_N_AnswerKey.pdf` | Item number, benchmark, answer, explanation |
| `pdfs/Question_Bank_Master.pdf` | All 532 items grouped by benchmark, with answers |
| `DEPLOY.md` | Publishing to GitHub Pages entirely through github.com |

Source (only needed to regenerate or extend the bank):
`blueprint.py`, `gen_common.py`, `gen_nso.py`, `gen_ar.py`, `gen_gr.py`, `gen_dp.py`,
`build_bank.py`, `verify.py`, `figures.py`, `make_pdfs.py`, `app_template.html`,
`build_app.py`.

## Rebuilding

```bash
pip install sympy matplotlib reportlab pillow --break-system-packages
python3 build_bank.py            # writes questions.json + verify_specs.json
python3 verify.py                # writes verification_report.txt, exit 0 only at 100%
python3 build_app.py             # inlines the bank into index.html
python3 make_pdfs.py             # writes the 29 PDFs into pdfs/
python3 build_bank.py --batch 3  # a 50-item slice, for batch-by-batch verification
```

## How verification works

`verify.py` never imports the generators. For each item it re-derives the answer with sympy
from a machine-readable spec built out of the numbers the student actually sees — and for
geometry and data items, straight out of the item's own stimulus (figure dimensions, box-plot
five-number summary, line-plot dot counts, table rows). It then runs structural checks on
every item: exactly one option matching the key for multiple choice, distractors distinct and
not numerically or algebraically equivalent, every answer present in its option list, accepted
equation-editor answers all equal to the key, matching maps covering every row, graphing
answers inside the plotted range, calculator flag matching the reporting category, and the
benchmark text matching the blueprint.

Twenty items are inherently non-computable (identifying a statistical question, describing the
shape of a distribution, translating an expression into words). Those are checked structurally
only, and the report says so and counts them separately.
