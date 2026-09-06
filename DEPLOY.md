# Publishing the practice test to GitHub Pages (browser only — no terminal, no git clone)

`index.html` is fully self-contained: all 532 questions, all CSS and JavaScript are inside
that one file. Nothing is loaded from a CDN, so publishing it is just uploading one file.

## 1. Create the repository

1. Go to **https://github.com** and sign in (create a free account if you don't have one).
2. Click the **+** in the top-right corner → **New repository**.
3. **Repository name:** `fast6-practice` (any name works — it becomes part of the URL).
4. Choose **Public**. GitHub Pages on free accounts only publishes public repositories.
5. Tick **Add a README file**.
6. Click **Create repository**.

## 2. Upload index.html

1. On the repository page, click **Add file** → **Upload files**.
2. Drag `index.html` into the box (or click *choose your files* and pick it).
3. Optional: also drag the `pdfs` folder if you want the printable papers available at the
   same link. GitHub's uploader accepts a whole folder by drag-and-drop.
4. Scroll down, leave "Commit directly to the `main` branch" selected, click **Commit changes**.

## 3. Turn on GitHub Pages

1. Click the **Settings** tab of the repository.
2. In the left sidebar click **Pages**.
3. Under **Build and deployment → Source**, choose **Deploy from a branch**.
4. Under **Branch**, choose **main** and folder **/ (root)**, then click **Save**.
5. Wait about 1–2 minutes. Refresh the Pages settings screen — it will show
   *"Your site is live at …"*. (The first build can take up to 5 minutes.)

## 4. The share URL

```
https://<your-github-username>.github.io/<repository-name>/
```

For example, if your username is `ataher` and the repository is `fast6-practice`:

```
https://ataher.github.io/fast6-practice/
```

`index.html` is served automatically at that address — you do not need to add `/index.html`.
The PDFs, if you uploaded them, are at
`https://ataher.github.io/fast6-practice/pdfs/Test_1_Questions.pdf`.

Send that link by text or email; it opens straight in Safari on the iPad.

## 5. Using it on the iPad

* Open the link in Safari.
* Tap the **Share** button → **Add to Home Screen**. It then opens full-screen, without the
  Safari address bar, which is closer to the real test delivery system.
* Results are stored in that browser's local storage on that iPad, so the attempt history
  and the "Clear my results" button are per-device.

### Making it genuinely offline

Safari will usually serve the page from its own cache when there is no network, but that is
not guaranteed. For a version that is offline for certain:

1. Open the link in Safari on the iPad.
2. Tap **Share** → **Save to Files** (or download `index.html` from the GitHub file view using
   the **Download raw file** button) and save it into *On My iPad → Downloads*.
3. Open it any time from the **Files** app. The whole test bank is inside the file, so it runs
   with the network off.

## 6. Updating it later

To publish a corrected or expanded version: open the repository, click `index.html`, click the
**pencil** icon → delete everything and paste the new file (or use **Add file → Upload files**
and upload a file with the same name; GitHub will replace it). Commit, and Pages rebuilds in
about a minute. The URL never changes.
