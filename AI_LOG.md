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
