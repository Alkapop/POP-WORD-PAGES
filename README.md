# POP-WORD — The Truth of the Truth

Offline-first Bible study app in David's personal format: Master Introduction → every chapter → Final Masterclass Review.

This folder is the **deployable copy** of the POP-WORD app, restructured so `index.html` sits at the root — ready for GitHub Pages. The main project (content sources, build pipeline, generation workflow) lives in `C:\Users\David\Documents\Projects\POP-WORD`; this copy is regenerated from it and should not be edited by hand.

## Host on GitHub Pages

1. Create a new repository on GitHub (e.g. `pop-word`).
2. From this folder, push it:
   ```
   git remote add origin https://github.com/<your-username>/pop-word.git
   git branch -M main
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Source: Deploy from a branch → Branch: main, folder: / (root) → Save**.
4. Your app will be live at `https://<your-username>.github.io/pop-word/` — index.html is served directly.

## Updating after new books are generated

In the main project, after a book is verified and built (`node build/build-data.mjs`), re-copy the app into this folder:

```powershell
Copy-Item C:\Users\David\Documents\Projects\POP-WORD\app\css   . -Recurse -Force
Copy-Item C:\Users\David\Documents\Projects\POP-WORD\app\data  . -Recurse -Force
Copy-Item C:\Users\David\Documents\Projects\POP-WORD\app\js    . -Recurse -Force
Copy-Item C:\Users\David\Documents\Projects\POP-WORD\app\index.html . -Force
git add -A && git commit -m "Update content" && git push
```

Scripture: World English Bible (public domain). Lexicon: Strong's Hebrew & Greek dictionaries (public domain, openscriptures).
