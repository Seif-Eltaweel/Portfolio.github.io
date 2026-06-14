# 🚀 Portfolio Website

A stunning **Data Scientist & ML Engineer** portfolio with a hidden admin panel for managing projects and skills — deployable to **GitHub Pages** in minutes.

---

## ✨ Features

- 🎨 **Dark Emerald theme** with glassmorphism, floating shapes & particle canvas
- ⚡ **Scroll-reveal animations** and micro-interactions throughout
- 📱 **Fully responsive** — mobile, tablet, desktop
- 🔐 **Admin panel** at `/admin.html` (password protected)
- ➕ **Add/Edit/Delete projects** with tags, image URL, GitHub & demo links
- ⚙️ **Manage skills** with emoji icons and proficiency levels
- 👤 **Update profile info** (name, bio, social links) from the admin
- 💾 **localStorage persistence** — data saved per-browser
- 🤖 **Typewriter effect** in the hero section
- 🔍 **Tag filtering** on the projects grid

---

## 📁 File Structure

```
portfolio/
├── index.html              # Main portfolio page
├── admin.html              # Admin panel (password: admin123)
├── css/
│   └── style.css           # Styles + design tokens
├── js/
│   ├── main.js             # Portfolio animations & rendering
│   ├── admin.js            # Admin panel logic
│   └── projects.js         # Shared localStorage data layer
└── .github/
    └── workflows/
        └── deploy.yml      # Auto-deploy to GitHub Pages
```

---

## 🚀 Deploy to GitHub Pages

### Step 1 — Create a GitHub Repo
1. Go to [github.com/new](https://github.com/new)
2. Name it `portfolio` (or `<yourusername>.github.io` for the root URL)
3. Set it to **Public**

### Step 2 — Push the code
```bash
cd portfolio
git init
git add .
git commit -m "🚀 Initial portfolio"
git branch -M main
git remote add origin https://github.com/<yourusername>/<repo-name>.git
git push -u origin main
```

### Step 3 — Enable GitHub Pages
1. Go to your repo → **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. The `deploy.yml` workflow will run automatically and deploy your site!

### Step 4 — Visit your site
Your portfolio will be live at:
```
https://<yourusername>.github.io/<repo-name>/
```

---

## 🔐 Admin Panel

Visit `https://<yourusername>.github.io/<repo-name>/admin.html`

**Default password:** `admin123`

> ⚠️ Change your password immediately via **Admin → Profile → Admin Password**

### What you can do in the admin:
| Tab | Actions |
|-----|---------|
| 🚀 Projects | Add, Edit, Delete portfolio projects (with tags, links, emoji, image) |
| ⚙️ Skills | Add, Edit, Delete skills displayed in the Skills section |
| 👤 Profile | Update your name, bio, email, social links, and admin password |

---

## 🎨 Personalizing

You can customize defaults directly in `js/projects.js`:
- `DEFAULT_META` — your name, role, bio, social links
- `DEFAULT_SKILLS` — starter skills list
- `DEFAULT_PROJECTS` — starter projects list

Or just use the Admin Panel — no code needed! ✨

---

## 📝 Notes

- **Data is stored in `localStorage`** — it's per-browser. If you want to access your portfolio data from multiple devices, you'd need a backend (Firebase, Supabase, etc.)
- The admin password is **client-side only** — it prevents casual visitors but is not a cryptographic security layer
- The site works entirely as **static files** with no build step needed
