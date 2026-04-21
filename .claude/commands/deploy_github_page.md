Deploy the latest frontend build to GitHub Pages so it is live at https://yujuiwu-svg.github.io/treasure-game/

Follow every step below in order. Do not skip any step.

---

## Step 1 — Commit any pending changes to master

Run:
```bash
git status --short
```

If there are uncommitted changes, stage and commit them:
```bash
git add -A
git commit -m "Update game"
```

## Step 2 — Push master to GitHub

Run:
```bash
git stash
git pull origin master --rebase
git stash pop || true
git push origin master
```

If `git stash pop` shows "No stash entries found", that is fine — continue.

## Step 3 — Build the frontend

Run:
```bash
npm run build
```

The output goes to `./build/`.

## Step 4 — Deploy build to gh-pages branch

Use a git worktree to deploy cleanly without switching branches:

```bash
git worktree add /tmp/gh-pages-deploy gh-pages
cd /tmp/gh-pages-deploy
git rm -rf . --quiet
cp -r <project-root>/build/. .
git add -A
git commit -m "Deploy: <brief description of what changed>"
git push origin gh-pages --force
cd <project-root>
git worktree remove /tmp/gh-pages-deploy
```

Replace `<project-root>` with the absolute path to this project: `D:/claude_code_project_demo/claude_code_treasure_game-initial`

## Step 5 — Confirm deployment

Run:
```bash
gh api repos/yujuiwu-svg/treasure-game/pages --jq '{status:.status, url:.html_url}'
```

## Step 6 — Final output

Tell the user:
- Status from the API (`built` means it is live)
- The live URL: **https://yujuiwu-svg.github.io/treasure-game/**
- Remind them to hard refresh with `Ctrl + Shift + R`
