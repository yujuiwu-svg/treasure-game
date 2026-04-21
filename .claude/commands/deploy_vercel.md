Deploy this project to Vercel and return the live URL.

## Steps

1. **Check Vercel CLI is installed** by running `vercel --version`. If not found, run `npm install -g vercel`.

2. **Check login status** by running `vercel whoami`. If not logged in, tell the user to run `! vercel login` in the prompt so the interactive login lands in the conversation.

3. **Build the project** by running `npm run build` from the project root. Stop and report any build errors before proceeding.

4. **Deploy to Vercel** by running:
   ```
   vercel --prod --yes
   ```
   - `--prod` deploys to the production URL (not a preview URL)
   - `--yes` skips interactive prompts by accepting defaults

5. **Extract and display the live URL** from the command output. The production URL is the line starting with `Production:` in the vercel output. Present it clearly to the user so they can open it in a browser.

## Notes

- The project root is the current working directory (`claude_code_treasure_game-initial/`).
- The build output goes to `./build/` (configured in `vite.config.ts`). Vercel should auto-detect this as a Vite project; if it asks for output directory, specify `build`.
- If this is the first deploy, Vercel will create a new project linked to this directory and save a `.vercel/` folder — that is expected.
- If deployment fails, show the full error output to the user and suggest fixes.
