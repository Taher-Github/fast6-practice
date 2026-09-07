# Saving every attempt into this repository

The practice app is a static page, so it cannot hold a GitHub token — anything in a public page is
readable by anyone. Instead a tiny **Cloudflare Worker** holds the token and writes each finished
attempt into this repository. One-time setup, about five minutes, free tier, no credit card.

When it is running:

* Your daughter just takes tests. Nothing to send, nothing to copy.
* Each finished test appears in this repo as
  `results/test-03/2026-09-07T08-42-11_sofia.json`
* You read them whenever you like — either by browsing the `results/` folder on github.com, or by
  opening **`results.html`** on the site, which lists every attempt, the score, the weakest
  benchmarks, and every missed item with the answer she gave.
* If the iPad is offline when she finishes, the attempt is kept on the device and uploads by itself
  the next time the app is opened online.

---

## Option B — no relay at all (nothing to set up)

If you would rather not run a Worker, the app can hand you the same data as a file:

1. On the device that took the tests, open the app's home screen. Under **Results saved on this
   device** press **Export results file** — it saves
   `fast6-results-<name>-<date>.json`, holding every finished attempt with every answer.
   (On an iPad it lands in Files → Downloads.)
2. Read it straight away: open `results.html` and use **Open an exported results file** at the top.
   Everything works — scores, weakest benchmarks, the wrong-answer register — for that file.
3. To keep it in the repository so it is there next time: on github.com open **fast6-practice** →
   **results** → **Add file → Upload files** → drop the exported file in → **Commit changes**.
   The dashboard reads any file in `results/`, single attempt or exported list alike.

What you give up compared with the relay: it is not automatic, and there is no live progress view —
watching a test as it happens needs something always reachable, which is what the Worker is.

---

## Option A — the relay (automatic, and enables live monitoring)

## Step 1 — a token that can only touch this repository

1. **https://github.com/settings/personal-access-tokens/new**
2. **Token name:** `fast6-results` · **Expiration:** 1 year (or *No expiration*)
3. **Repository access:** *Only select repositories* → choose **fast6-practice**
4. **Repository permissions:** find **Contents** and set its Access dropdown to **Read and write**.
   Nothing else — this token can write only into this one repository.
5. **Generate token** and copy it.

## Step 2 — the Worker

1. Go to **https://dash.cloudflare.com** and sign up / log in (free plan is enough).
2. In the sidebar: **Compute (Workers)** → **Workers & Pages** → **Create** → **Start with Hello World!**
   → **Get started**.
3. Give it a name, for example `fast6-results`, then **Deploy**.
4. Click **Edit code** (or **Continue to project → Edit code**). Delete everything in the editor and
   paste the whole contents of **`worker/results-worker.js`** from this repository. Click **Deploy**.

## Step 3 — the variables

In the Worker: **Settings → Variables and Secrets → Add**

| Name | Type | Value |
|---|---|---|
| `GH_TOKEN` | **Secret** | the token from step 1 |
| `GH_REPO` | Text | `Taher-Github/fast6-practice` |
| `ORIGIN` | Text | `https://taher-github.github.io` |
| `ADMIN_KEY` | **Secret** | any password you choose — the monitor asks for it once |

**Deploy** again so the variables take effect.

Copy the Worker address shown at the top — it looks like
`https://fast6-results.<your-subdomain>.workers.dev`.

## Step 4 — a KV namespace, for live monitoring

Live progress is kept in Cloudflare KV rather than the repository, so watching a test does not
create dozens of commits.

1. In the Cloudflare sidebar: **Storage & Databases → KV → Create a namespace**, name it
   `fast6_progress`, **Add**.
2. Back in the Worker: **Settings → Bindings → Add → KV namespace**.
   **Variable name:** `PROGRESS` (exactly this) · **KV namespace:** `fast6_progress` · **Deploy**.

Skipping this step is fine — finished results still save; only the live view is unavailable.

## Step 5 — point the app at it

Open **https://taher-github.github.io/fast6-practice/** on any device, expand
**Results link (set once)** on the home screen, paste the Worker address, press **Save**.

That setting lives in that browser, so do it once on the iPad she uses. (Send me the address and I
can bake it into the page instead, so any device saves results without configuring anything.)

## Watching a test from your own device

Open **https://taher-github.github.io/fast6-practice/results.html** on your phone or laptop, expand
**Monitor settings**, paste the same Worker address and the `ADMIN_KEY` you chose, press **Save**.
The panel then refreshes every 15 seconds and shows, for each test being taken right now: the
student, the test, which question they are on, how many answered, how many correct so far, the
question numbers already wrong, and elapsed time. The row disappears when the test is submitted and
the finished result appears in `results/`.

Everything is reported: timed tests, untimed practice runs, and *Practice these questions* runs over
her review list — the **Mode** column says which. A row disappears when that run is submitted, and an
abandoned one clears itself after three hours.

The address and key are stored in **your** browser only — they are not part of the published page, so
the iPad taking the test cannot read them.

## Checking it works

Take any test in **practice mode** and finish it — the results screen should end with
*"✓ Saved to your GitHub repository under results/."* A new file appears in `results/test-NN/`
within a few seconds, and `results.html` shows it after a refresh.

If it says the attempt is waiting to upload, open the Worker address directly in a browser: it should
answer `{"ok":true,"service":"fast6 results relay"}`. If it does, re-check that `GH_TOKEN` is a
**Secret**, that Contents is **Read and write**, and that the token's repository access includes
`fast6-practice`.

## What is stored

Each file holds the score, the per-category and per-benchmark breakdown, and for every item: the
benchmark, the answer given, the correct answer, seconds spent, and whether it was flagged. No
personal data beyond the name typed in the **Student** box, which can be left empty.

Note that the repository is public, so these result files are public too. If you would rather they
were not, make the repository private in **Settings → General → Danger Zone** — but GitHub Pages on a
free account only publishes public repositories, so the test app would stop being reachable by link.
The clean split, if you want privacy: keep `fast6-practice` public for the app, create a second
**private** repo (say `fast6-results`), and set the Worker's `GH_REPO` to that one. `results.html`
then won't be able to read them without a login, but the files are all in the private repo for you.
