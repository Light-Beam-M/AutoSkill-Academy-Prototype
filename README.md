# AutoSkill App — Prototype

Clickable prototype for AutoSkill Academy's business pitch: skill assessment → course → 3D Virtual Lab (robot arm pick & place) → booking → Skill Passport → Job Matching, plus a B2B quote page for factories.

Static site, no build step. Three.js is vendored in `lib/`.

- Visitors see the clean user view. Presenter tools (reset, simulate exam passed) only appear on presenter links:
  `/?presenter=1`, `/?demo=1#passport` (enrolled, exam pending), `/?demo=2#passport` (certified)
- Run locally: `python -m http.server 8765` (or double-click `start-demo.bat` on Windows), then open http://localhost:8765
- `render.html` renders the 3D models used in the pitch deck (`?scene=arm|arm2|plc|cap|market|stairs`)

Course dates, job roles and salary ranges are illustrative data for the pitch.
