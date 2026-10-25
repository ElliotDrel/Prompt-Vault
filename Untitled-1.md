TO DO (PV):
1. /gsd:audit-milestone
2. /gsd:list-phase-assumptions 16
2. /gsd:discuss-phase 16
3. phase 16 stuff: if a user is on /library for a prompt they own, it should act the exact same way as if they are on /dashboard for it. (if we get rid of this page then i cant share links)

---
When the user is on the root page, you should do all of the relevant caching and processing. As soon as the user clicks "Go to app", it automatically loads in and doesn't have to do the /redirect to /off sometimes because of delay. (This actually works this way: if I go to /dashboard from the root and then go back to the root and then go back to the dashboard, there is no delay. There is no loading prompts; there's no on-authentication loading checking thing. All that should happen as soon as we get to the root to make it seamless for the user, but obviously only if they're authenticated.)
---

prompt vault issues:

- Add a warning to the user if they create variables and then never do anything with them in the actual prompt. This warning should show up both when they try to save the prompt and then as a backup when they try to click the copy button. Copy with variables. If that variable isn't used, it should make it red and not allow the user to use it. (I need to add more info that variables that are NOT mentioned by name in the prompt will be appended to the bottom)
- Add ability to subscribe to public prompts, to send notifications about certain public prompts when there are changes to them
