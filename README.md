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
| `results.html` | Dashboard for saved attempts — scores, weakest benchmarks, every missed item |
| `SETUP_RESULTS.md` | One-time setup so finished tests save themselves into `results/` |
| `worker/results-worker.js` | The Cloudflare Worker that holds the token and writes the results |
| `results/test-NN/*.json` | One file per finished attempt (created automatically) |

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

## Monitoring and review

* **Live progress** — `results.html` shows any run in progress right now — timed, practice or a
  review run — with the mode, current question, answered, correct so far, which question numbers are
  already wrong, and elapsed time. Needs the relay's `ADMIN_KEY`, which lives only in your browser.
* **Wrong answers by question** — the same page has a *Wrong answers* view: every question missed
  across all saved attempts, with test and question number, how many times it was missed, the
  answer given and the correct answer.
* **On the student's device** — every wrong answer is kept in a *Questions to review* list on the
  home screen, grouped by test with question numbers, and **Practice these questions** replays just
  those items; ones answered correctly leave the list.

## Saved attempts

Finished tests write themselves into `results/test-NN/` as JSON — score, per-category and
per-benchmark breakdown, and for every item the answer given, the correct answer, seconds spent and
whether it was flagged. Open `results.html` on the site to read them, or browse the folder here.
Setup is in `SETUP_RESULTS.md`, which has two routes: the relay (automatic, and the only way to get
live monitoring) or a plain **Export results file** button on the home screen whose file you upload
into `results/` yourself, or open directly in the dashboard. Until either is used, results stay on
the device that took the test and appear in the app's own attempt history.
