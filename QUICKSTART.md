# ⚡ QUICK START CHECKLIST

Copy-paste these commands in order. Takes ~10 minutes!

## Step 1: Copy Files to Your Job-Automation Folder
```powershell
# Windows PowerShell (Run as Administrator)

# Navigate to your folder
cd C:\Users\MALAV\job-automation

# Create required files - COPY EACH FILE below
```

---

## Step 2: Create .env File

In PowerShell:
```powershell
@"
ANTHROPIC_API_KEY=sk-ant-IFVjA-W5-8LwA-YOUR-FULL-KEY-HERE
GITHUB_USERNAME=MalavSh3th
CAREER_OPS_OUTPUT_PATH=./career-ops-results.csv
"@ | Out-File -Encoding UTF8 .env
```

Replace `sk-ant-IFVjA-W5-8LwA-YOUR-FULL-KEY-HERE` with your actual full API key.

---

## Step 3: Initialize Node Project

```powershell
npm init -y
npm install @anthropic-ai/sdk axios csv-parser dotenv google-spreadsheet node-fetch
```

---

## Step 4: Update evaluate-jobs.js

In the `evaluate-jobs.js` file, find this section:
```javascript
const RESUMES = {
  cybersecurity: `[PASTE YOUR CYBERSECURITY RESUME HERE]`,
  ai_ml: `[PASTE YOUR AI/ML RESUME HERE]`,
  software_engineer: `[PASTE YOUR SOFTWARE ENGINEER RESUME HERE]`,
  data_analyst: `[PASTE YOUR DATA ANALYST RESUME HERE]`
};
```

**Replace the placeholder text with your actual resumes.** Copy the full text of each resume into the backticks.

---

## Step 5: Test Run

```powershell
# Verify setup
npm run fetch
# Should show: "Fetched X jobs from past 24 hours"

npm run evaluate
# Should show: Job evaluations with fit scores

npm run upload
# Should create: job-evaluations-results.csv
```

---

## Step 6: (Optional) Set Up GitHub Automation

```powershell
# Initialize git
git init
git add .
git commit -m "Initial job automation setup"

# Create GitHub repo and push
# Then add GitHub Secrets (see SETUP_GUIDE.md)
```

---

## 📁 Files You Need to Download

I've created these files for you. Copy them to `C:\Users\MALAV\job-automation\`:

- ✅ `package.json` - Dependencies list
- ✅ `.env.example` - Template (copy to `.env` and edit)
- ✅ `fetch-jobs.js` - Fetch jobs from career-ops
- ✅ `evaluate-jobs.js` - Claude evaluation (UPDATE YOUR RESUMES HERE!)
- ✅ `upload-to-sheets.js` - Export results
- ✅ `.github/workflows/daily-jobs.yml` - GitHub Actions automation
- ✅ `SETUP_GUIDE.md` - Full documentation

---

## ❌ Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "Cannot find module '@anthropic-ai/sdk'" | Run `npm install` first |
| "API key not found" | Check .env file exists and ANTHROPIC_API_KEY is set |
| "Jobs file not found" | Run `npm run fetch` before `npm run evaluate` |
| "Access denied .env" | Delete .env and recreate it |

---

## ✅ Success Indicators

✅ `npm run fetch` → Shows jobs fetched
✅ `npm run evaluate` → Shows fit scores (75+, 60-74, <60)
✅ `npm run upload` → Creates CSV file
✅ CSV file opens in Excel with results
✅ Ready to run daily!

---

## 🎯 Next: GitHub Automation (Optional but Recommended)

Once local testing works:

1. Push to GitHub: `git push -u origin main`
2. Add GitHub Secrets: API key, username
3. GitHub Actions runs daily at 9 AM automatically
4. Results auto-save to your repo

See SETUP_GUIDE.md for full GitHub steps.

---

**Ready? Start with Step 1 above! 🚀**
