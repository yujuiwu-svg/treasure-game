Deploy this full-stack project (React + Express + SQLite) to GitHub and Render so it is live on the internet.

Follow every step below in order. Do not skip any step.

---

## Step 1 — Prepare the Express server for production

Open `server/index.ts`. Add static file serving so the Express server can serve the built React frontend in production. The final file should look like this:

```ts
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth';
import scoresRoutes from './routes/scores';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/scores', scoresRoutes);

// Serve built frontend in production
if (isProd) {
  const buildPath = path.join(__dirname, '../build');
  app.use(express.static(buildPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Step 2 — Add a production start script to package.json

Open `package.json` and add two scripts:
- `"start": "node --loader tsx/esm server/index.ts"` — used by Render to start the server in production
- `"build:full": "vite build && npm run start"` — not needed but document for clarity

Actually add only:
```json
"start": "tsx server/index.ts"
```

to the `scripts` section.

## Step 3 — Create render.yaml

Create a file called `render.yaml` in the project root with this content:

```yaml
services:
  - type: web
    name: treasure-game
    runtime: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
    disk:
      name: sqlite-data
      mountPath: /var/data
      sizeGB: 1
```

## Step 4 — Update the SQLite database path for production

Open `server/db.ts`. Change the database file path so that in production it uses `/var/data/game.db` (the persistent disk mount on Render) and in development it uses the local `game.db`. Apply this pattern:

```ts
const dbPath = process.env.NODE_ENV === 'production'
  ? '/var/data/game.db'
  : 'game.db';
```

Use this `dbPath` variable when opening the database instead of the hardcoded filename.

## Step 5 — Create or update .gitignore

Create or update `.gitignore` in the project root to include:

```
node_modules/
build/
game.db
*.db
.env
.env.local
dist/
```

## Step 6 — Initialize git and push to GitHub

Run the following steps using Bash:

1. Check if a git repo is already initialized: `git status`
2. If not initialized, run: `git init`
3. Stage all files: `git add -A`
4. Commit: `git commit -m "Initial commit: full-stack treasure game"`
5. Check if `gh` CLI is available: `gh --version`
   - If not available, tell the user: "Please install the GitHub CLI from https://cli.github.com/ and run `gh auth login`, then re-run this command."
   - If available, continue.
6. Create a new public GitHub repo and push:
   ```bash
   gh repo create treasure-game --public --source=. --remote=origin --push
   ```
   - If a repo already exists (error about remote), run: `git push -u origin main` (or `master` if that's the branch name).
7. After pushing, run `gh repo view --web` to get the GitHub URL and show it to the user.

## Step 7 — Guide the user to deploy on Render

Tell the user:

---

**Your code is now on GitHub. To go live on the internet with a free URL, follow these steps on Render:**

1. Go to **https://render.com** and sign up / log in (free account works).
2. Click **"New +"** → **"Web Service"**.
3. Click **"Connect a repository"** and select your `treasure-game` GitHub repo.
4. Render will auto-detect `render.yaml` and pre-fill all settings.
5. Click **"Create Web Service"**.
6. Wait ~3-5 minutes for the first deploy to finish.
7. Your live URL will be shown at the top of the Render dashboard — it looks like `https://treasure-game-xxxx.onrender.com`.

**SQLite note:** The `render.yaml` includes a 1 GB persistent disk mounted at `/var/data`, so your database survives redeploys. Free tier disks are not available — you'll need the **Starter plan ($7/month)** for persistence, or use the free tier knowing the database resets on each redeploy.

---

## Step 8 — Final output

Show the user:
- The GitHub repo URL
- A reminder of the Render deployment steps above
- Confirm which files were modified: `server/index.ts`, `server/db.ts`, `package.json`, `render.yaml`, `.gitignore`
