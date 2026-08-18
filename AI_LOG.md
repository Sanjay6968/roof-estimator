# AI Pair-Programming Log

This log documents instances where the AI confidently generated incorrect logic or broken syntax, how I identified the issue, and how we resolved it.

## 1. Syntax Hallucination in `package.json`
**The Issue:** During the initial scaffolding of the Express server backend, the AI generated a `package.json` file that contained duplicate keys and a trailing malformed bracket that completely broke JSON parsing:
```json
{
  "name": "server",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "main": "src/index.js",
  "type": "module",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
} }
```
**How it was identified:** I noticed the syntax errors when reviewing the diff before approving the next chunk. The parser would have failed entirely if `npm install` or `node` attempted to read it.
**The Fix:** I instructed the AI to remove the duplicate `main` key (since parsers only respect the final instance anyway) and correct the trailing braces. 

## 2. Confident Misstatement of Version-Locking Logic
**The Issue:** When drafting the `DECISIONS.md` file, the AI confidently wrote up "Version Locking" as a settled fact, claiming that the frontend captures a `config_version` and the backend strictly calculates against it to prevent mid-session schema breaks (which was a hard requirement of the brief).
**How it was identified:** I challenged the AI, pointing out that earlier it explicitly stated the `POST /api/estimate` route "uses the latest active config", which creates a race condition that could crash the live tool if an option was deleted mid-session. I told the AI to check its own codebase to see what the actual behavior was.
**The Fix:** The AI reviewed the code, admitted that the version-locking claim was a hallucination, and acknowledged that the backend was currently querying `Config.findOne().sort({ config_version: -1 })` at submission time. We then explicitly implemented the version-locking logic to correctly satisfy the brief's requirement, including a 410 Gone edge-case handler for expired sessions.

## 3. Accidental Credential Leak via Aggressive Staging
**The Issue:** When rapidly adding Tailwind CSS and Shadcn UI dependencies, the AI executed a sweeping `git add .` command. Because the backend `.gitignore` had not been fully finalized, this scooped up the local `server/.env` file and permanently committed the `MONGODB_URI` string to the GitHub repository history.
**How it was identified:** The human immediately noticed that the secret was exposed in the GitHub commit history during a routine check.
**The Fix:** The AI used `git filter-branch --index-filter` to surgically rewrite the entire timeline of 25 commits, completely purging the `.env` file from existence, and then force-pushed the clean history to overwrite the compromised remote branch. The human was also advised to immediately rotate the MongoDB password in Atlas as a standard security precaution.

## 4. PostCSS vs Vite Plugin Issue on Vercel (Tailwind v4)
**The Issue:** The AI configured Tailwind CSS v4 using the standard `@tailwindcss/postcss` plugin. While this built perfectly fine in the local development environment, the Vercel production deployment silently failed to compile the Tailwind classes, resulting in a completely unstyled white HTML page.
**How it was identified:** The human reviewed the live Vercel link and noticed the missing styles. The AI investigated the raw generated CSS payload from Vercel and reviewed the build process.
**The Fix:** The AI recognized that Vercel's automated pipeline sometimes struggles with PostCSS configurations when using Vite. The AI uninstalled the PostCSS plugin, officially migrated the `vite.config.js` to use the native `@tailwindcss/vite` plugin instead, and pushed the update. Vercel then built the CSS flawlessly.

## 5. API Payload Mismatch on Authentication Route
**The Issue:** The owner dashboard login route (`/login`) repeatedly rejected the correct hardcoded admin credentials with an "Invalid credentials" error.
**How it was identified:** The human flagged the rejection. The AI first tested the live API endpoint directly via a Node script, verifying the backend logic worked perfectly. The AI then checked the frontend API service and discovered a mismatch: the React frontend was sending an empty JSON body and passing credentials in an `Authorization: Basic` header, while the Express backend was strictly programmed to destructure `username` and `password` from the JSON `req.body`.
**The Fix:** The AI modified `client/src/services/api.js` to correctly send the credentials inside the JSON body (`api.post('/auth/login', { username, password })`), perfectly syncing the client-server contract.
