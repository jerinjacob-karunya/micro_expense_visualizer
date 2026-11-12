# Micro-Expense Visualizer (MEV)

25CS208 Web Technology micro-project. Plain HTML5, CSS3 and JavaScript. No build step, no backend.
All data (accounts, expenses, theme, chat) is saved in the browser with `localStorage`.

## Run it on your computer
The Quick-add presets use `fetch()`, so open the site through a small web server (double-clicking the file will not load them).
1. Open this folder in VS Code and install the **Live Server** extension.
2. Right-click `index.html` and choose **Open with Live Server**.

## Put it on GitHub and Vercel
1. Create an empty repository on github.com, then in this folder run:
   `git init`, `git add .`, `git commit -m "MEV micro-project"`, `git branch -M main`,
   `git remote add origin <your-repo-url>`, `git push -u origin main`
2. Go to vercel.com, sign in with GitHub, press **Add New > Project**, pick the repository and press **Deploy**.
   (Framework preset: **Other**. Leave the build command and output folder empty.)
3. Vercel gives you a `https://<name>.vercel.app` link with HTTPS. Use it for the QR code.

## Folder structure
```
index.html  register.html  signup.html  signin.html  home.html
add-expense.html  analytics.html  profile.html  help.html  about.html
subscriptions.json        presets for Quick-add
assets/logo.svg
css/styles.css            design tokens (light + dark), base styles, components
css/layout.css            mobile-first page layouts (header drawer, grids, breakpoints)
js/theme.js               light / dark toggle (FR-07)
js/validation.js          regex validation (FR-02, FR-03, FR-04)
js/chatbot.js             offline chatbot (FR-06)
js/calculator.js          floating calculator button + pop-up (FR-08)
js/chart.js               bar + line chart (landing hero and dashboard)
js/storage.js             localStorage helpers
js/utils.js               money formatting, small helpers
js/auth.js                create account, sign in, sign out
js/app.js                 header + the code for each page
```

## Checklist map (use it for Appendix B.1)
| ID | Requirement | Where |
|----|-------------|-------|
| FR-01 | Landing page, header with logo, links and theme button, hero, feature cards | `index.html`, `css/layout.css` |
| FR-02 | Register form, 7 fields, regex on blur and submit, error badges, disabled submit | `register.html`, `js/validation.js` |
| FR-03 | Sign-up with email, password and Terms checkbox | `signup.html` |
| FR-04 | Sign-in with eye toggle and error banner | `signin.html`, `js/validation.js`, `js/app.js` |
| FR-05 | Dashboard: CSS Grid `250px 1fr 300px` from 768px, Flexbox column below, hamburger drawer | `home.html`, `css/layout.css` |
| FR-06 | Chatbot: fixed bottom-right button, panel, `.user-msg` / `.bot-msg`, keyword replies, auto-scroll | `js/chatbot.js` |
| FR-07 | Theme toggle, `:root` variables, saved in `localStorage` | `js/theme.js`, `css/styles.css` |
| FR-08 | Calculator (button left of the chat button, on every page) with divide-by-zero and invalid-expression errors | `js/calculator.js`, `css/styles.css` |
