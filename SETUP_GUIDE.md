# 🤖 Job Automation Workflow Setup Guide

Welcome to your automated job application workflow! This guide will walk you through setup and usage.

## 📋 What This Does

This automation system:
1. **Fetches jobs** from your career-ops results (past 24 hours, US only)
2. **Evaluates fit** using Claude AI (fit score, decision, resume bullets)
3. **Generates cold emails** tailored to each job
4. **Exports results** to CSV/Markdown for easy access
5. **Runs automatically** daily via GitHub Actions (if deployed)

---

## 🚀 Quick Start (5 minutes)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Up Environment Variables

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` with your values:
```
ANTHROPIC_API_KEY=sk-ant-xxxxx-your-full-key-xxxxx
GITHUB_USERNAME=MalavSh3th
CAREER_OPS_OUTPUT_PATH=./career-ops-results.csv
```

### Step 3: Update Your Resumes in Code

Edit `evaluate-jobs.js` and replace the placeholder resumes with your actual resume content:

```javascript
const RESUMES = {
  cybersecurity: `[PASTE YOUR SECURITY RESUME HERE]`,
  ai_ml: `[PASTE YOUR AI/ML RESUME HERE]`,
  software_engineer: `[PASTE YOUR SOFTWARE RESUME HERE]`,
  data_analyst: `[PASTE YOUR DATA ANALYST RESUME HERE]`
};
```

### Step 4: Run Tests Locally

```bash
# Step 1: Fetch jobs from career-ops
npm run fetch

# Expected output: "✅ Fetched X jobs from past 24 hours"

# Step 2: Evaluate jobs with Claude
npm run evaluate

# Expected output: Shows fit scores and decisions for each job

# Step 3: Export results
npm run upload

# Expected output: Files created:
# - job-evaluations-results.csv
# - job-evaluations-results.md
```

---

## 📂 Project Structure

```
job-automation/
├── package.json                 # Dependencies
├── .env.example                 # Template for environment variables
├── .env                         # Your actual secrets (create from example)
├── fetch-jobs.js               # Fetches jobs from career-ops
├── evaluate-jobs.js            # Claude API evaluation
├── upload-to-sheets.js         # Export results
├── jobs-to-evaluate.json       # Generated: jobs to evaluate
├── job-evaluations.json        # Generated: raw evaluations
├── job-evaluations-results.csv # Generated: spreadsheet format
├── job-evaluations-results.md  # Generated: readable markdown
└── .github/
    └── workflows/
        └── daily-jobs.yml      # GitHub Actions automation
```

---

## 🔑 API Keys & Credentials

### Anthropic API Key
1. Go to: https://console.anthropic.com/
2. Click **API Keys** → **Create Key**
3. Copy the key starting with `sk-ant-`
4. Add to `.env`: `ANTHROPIC_API_KEY=sk-ant-xxxxx`

### Career-ops Output
1. Run your career-ops pipeline (you already have this set up)
2. Export results to `career-ops-results.csv`
3. Place in same folder as these scripts
4. Script will auto-detect and fetch jobs

### Google Sheets (Optional - for auto-sync)
1. Go to: https://console.cloud.google.com/
2. Create new project: `job-automation`
3. Enable: Google Sheets API + Google Drive API
4. Create Service Account → Download JSON key
5. Create a Google Sheet and share with service account email
6. Add credentials to `.env`

**For now, CSV export works great!**

---

## 💻 Running the Workflow

### Option 1: Run Manually (Anytime)
```bash
npm run all        # Fetch → Evaluate → Export (all steps)

# Or run individually:
npm run fetch      # Just fetch jobs
npm run evaluate   # Just evaluate
npm run upload     # Just export
```

### Option 2: Automated Daily (GitHub Actions)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial setup"
   git push origin main
   ```

2. **Add GitHub Secrets:**
   - Go to your GitHub repo
   - **Settings** → **Secrets and variables** → **Actions**
   - Add these secrets:
     - `ANTHROPIC_API_KEY` = your API key
     - `GITHUB_USERNAME` = MalavSh3th
   
3. **GitHub Actions will run daily at 9 AM UTC**
   - Go to **Actions** tab to view runs
   - Check logs for results

---

## 📊 Understanding the Output

### CSV File (job-evaluations-results.csv)
Open in Excel/Google Sheets:
- **Job Title** - Position name
- **Company** - Employer
- **Fit Score** - 0-100 match percentage
- **Decision** - APPLY / MAYBE / SKIP
- **Track** - Which resume was used
- **Resume Bullets** - 3 customized bullets for this job
- **Cold Email** - Draft email to send
- **Job Link** - Direct link to posting

### Markdown File (job-evaluations-results.md)
Human-readable format:
- Organized by Decision (APPLY first)
- Full context for each job
- Easy to read in any text editor

### JSON Files (for programmatic use)
- `job-evaluations.json` - Raw Claude evaluations
- `jobs-to-evaluate.json` - Jobs fetched from career-ops

---

## 🎯 Making Decisions

### APPLY (Fit Score 75+)
- High match with your experience
- Action: Use resume bullets in application, send cold email

### MAYBE (Fit Score 60-74)
- Moderate match, worth exploring
- Action: Research company further, customize more

### SKIP (Fit Score <60)
- Poor match or requires unavailable skills
- Action: Skip this application

---

## 💡 Tips & Tricks

### Customize Job Evaluation
Edit the prompt in `evaluate-jobs.js` to change evaluation criteria:
```javascript
const prompt = `
  // Modify this prompt to add/remove criteria
  // Currently evaluates: fit score, fit explanation, resume bullets, cold email
`;
```

### Filter Jobs Before Evaluation
Edit `fetch-jobs.js` to add filters:
```javascript
// Example: only junior roles (0-3 years)
if (row.experience_required <= 3) { /* keep job */ }

// Example: only certain companies
if (['Google', 'Amazon', 'Apple'].includes(row.company)) { /* keep job */ }
```

### Speed Up Evaluation
Reduce `max_tokens` in `evaluate-jobs.js`:
```javascript
max_tokens: 500,  // Lower = faster but less detailed
```

### Reduce API Costs
Use Claude Haiku (cheaper) instead of Sonnet:
```javascript
model: 'claude-3-haiku-20240307',  // Faster & cheaper
```

---

## 🐛 Troubleshooting

### Error: "API key not found"
```
Solution: Check .env file exists and ANTHROPIC_API_KEY is set
Run: cat .env | grep ANTHROPIC
```

### Error: "Jobs file not found"
```
Solution: Run "npm run fetch" first
Check: career-ops-results.csv exists in folder
```

### Error: "Invalid JSON from Claude"
```
Solution: Claude API rate limited or API error
Try: Wait a few minutes and run again
Increase rate limit: Edit fetch delay in evaluate-jobs.js
```

### GitHub Actions not running
```
Solution: Check workflow syntax
Go to: repo/Actions tab and check for errors
```

---

## 📈 Cost Estimation

**API Usage:**
- Per job evaluation: ~1,500 tokens
- Cost: ~$0.03-0.05 per job
- 20 jobs/day: ~$0.60/day or ~$18/month
- 50 jobs/day: ~$1.50/day or ~$45/month

**Free Tier:**
- New Anthropic accounts get $5 free credits
- That covers ~100-150 job evaluations

**To Reduce Cost:**
- Use Claude Haiku: 70% cheaper
- Evaluate fewer jobs (filter first)
- Reduce output length

---

## 🔐 Security Notes

- **Never commit .env file** (git ignores it automatically)
- **Use GitHub Secrets** for sensitive data
- **Rotate API keys** periodically
- **Keep API keys private** - never share in chat/email

---

## 📞 Support

If something breaks:
1. Check error messages (usually in console output)
2. Verify all environment variables are set
3. Try running steps individually
4. Check API quotas (Anthropic console)
5. Review GitHub Actions logs

---

## 🎉 Next Steps

1. ✅ Update resumes in `evaluate-jobs.js`
2. ✅ Run `npm run all` to test
3. ✅ Review results in CSV file
4. ✅ Push to GitHub for daily automation
5. ✅ Customize filters/prompts as needed

---

**Good luck with your job search! 🚀**
