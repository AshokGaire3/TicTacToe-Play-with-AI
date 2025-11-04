# GitHub Pages Deployment

This folder contains a standalone version of the Tic-Tac-Toe game that can be deployed to GitHub Pages.

## What's Different

This version runs **entirely in the browser** - no Flask backend needed:
- ✅ AI logic ported to JavaScript
- ✅ All three difficulty levels (Easy, Medium, Hard)
- ✅ No server required
- ❌ Database logging not available (static site limitation)

## Files

- `index.html` - Main HTML file
- `style.css` - Styling
- `ai.js` - AI logic (JavaScript port)
- `game.js` - Game logic

## Deploying to GitHub Pages

### Method 1: Using `docs/` folder (Recommended)

1. **Push to GitHub:**
   ```bash
   git add docs/
   git commit -m "Add GitHub Pages deployment"
   git push origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your GitHub repository
   - Click **Settings** → **Pages**
   - Under **Source**, select **"Deploy from a branch"**
   - Select **Branch: main** and **Folder: /docs**
   - Click **Save**

3. **Your site will be live at:**
   ```
   https://YOUR_USERNAME.github.io/REPO_NAME/
   ```

### Method 2: Using root folder

If you prefer to use the root folder:

1. Move files from `docs/` to root:
   ```bash
   mv docs/index.html .
   mv docs/style.css .
   mv docs/ai.js .
   mv docs/game.js .
   ```

2. Enable GitHub Pages:
   - Go to **Settings** → **Pages**
   - Select **Branch: main** and **Folder: / (root)**
   - Click **Save**

## Testing Locally

Before deploying, test locally:

```bash
cd docs
python3 -m http.server 8000
```

Then visit: `http://localhost:8000`

## Features

- ✅ Three difficulty levels (Easy, Medium, Hard)
- ✅ Player/AI switching
- ✅ Responsive design
- ✅ All AI algorithms work in browser

## Limitations

- ❌ No database logging (static site)
- ❌ No server-side game history
- ✅ All game logic runs client-side

## Notes

- The AI logic is identical to the Python backend
- All difficulty levels work the same way
- No external dependencies required
- Works offline once loaded

