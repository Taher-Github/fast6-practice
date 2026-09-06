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

## Step 3 — the three variables

In the Worker: **Settings → Variables and Secrets → Add**

| Name | Type | Value |
|---|---|---|
| `GH_TOKEN` | **Secret** | the token from step 1 |
| `GH_REPO` | Text | `Taher-Github/fast6-practice` |
| `ORIGIN` | Text | `https://taher-github.github.io` |

**Deploy** again so the variables take effect.

Copy the Worker address shown at the top — it looks like
`https://fast6-results.<your-subdomain>.workers.dev`.

## Step 4 — point the app at it

Open **https://taher-github.github.io/fast6-practice/** on any device, expand
**Results link (set once)** on the home screen, paste the Worker address, press **Save**.

That setting lives in that browser, so do it once on the iPad she uses. (Send me the address and I
can bake it into the page instead, so any device saves results without configuring anything.)

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
