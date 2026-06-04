import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Your resumes for each track - PASTE YOUR ACTUAL RESUMES HERE
const RESUMES = {
  cybersecurity: `
    Cybersecurity Professional with hands-on experience in penetration testing, vulnerability assessment, and security operations.
    - Conducted network and web application penetration tests using Burp Suite, Metasploit, and Nmap
    - Performed OWASP Top 10 vulnerability assessments and remediation for client environments
    - Monitored and analyzed security events using SIEM platforms (Splunk, QRadar)
    - Applied MITRE ATT&CK framework for threat modeling and incident response
    - Proficient in Kali Linux, Wireshark, and other security tooling
    
    Key Skills: Penetration Testing, Burp Suite, OWASP, SIEM, MITRE ATT&CK, Kali Linux
    Experience: Security Analyst Intern at DigitalXForce, Penetration Tester at Community Dreams Foundation
  `,
  ai_ml: `
    AI/ML Engineer with experience building and deploying machine learning models for NLP and anomaly detection tasks.
    - Developed deep learning models using TensorFlow and PyTorch for text classification and NLP pipelines
    - Built BERT-CNN hybrid architectures for sentiment analysis (ABSA Project)
    - Implemented anomaly detection systems using Scikit-learn and statistical modeling
    - Managed ML experiments and model versioning with MLflow
    - Experience with NLP research, data preprocessing, and feature engineering
    
    Key Skills: TensorFlow, PyTorch, Scikit-learn, BERT-CNN, MLflow, NLP, Anomaly Detection
    Experience: ABSA Project, NLP research
  `,
  software_engineer: `
    Full-Stack Software Engineer with experience in enterprise .NET applications and cloud-native backend development.
    - Developed RESTful APIs and microservices using .NET/C# and Spring Boot
    - Implemented CI/CD pipelines using GitHub Actions and Azure DevOps
    - Built scalable backend services with Node.js and Express
    - Experience with SQL/NoSQL databases, Docker, and Agile development
    - Web developer at Sahu Technologies delivering production-grade applications
    
    Key Skills: .NET, C#, CI/CD, Spring Boot, RESTful APIs, Node.js
    Experience: Web developer at Sahu Technologies
  `,
  data_analyst: `
    Data Analyst with expertise in transforming raw data into actionable business insights using modern BI tools.
    - Created interactive dashboards and reports using Tableau and Power BI
    - Performed data wrangling, cleaning, and analysis using Pandas and Python
    - Designed and optimized SQL queries for ETL pipelines and data warehouse operations
    - Applied statistical modeling and regression analysis for predictive insights
    - Delivered data analysis projects end-to-end from data ingestion to stakeholder presentation
    
    Key Skills: Pandas, Tableau, Power BI, SQL, ETL, Statistical Modeling
    Experience: Data analysis projects
  `
};

/**
 * Determine which resume track best matches the job
 */
function determineJobTrack(jobTitle, jobDescription) {
  const title = jobTitle.toLowerCase();
  const description = jobDescription.toLowerCase();
  const combined = `${title} ${description}`;

  if (combined.includes('security') || combined.includes('penetration') || combined.includes('siem')) {
    return 'cybersecurity';
  } else if (combined.includes('ai') || combined.includes('machine learning') || combined.includes('nlp') || combined.includes('data science')) {
    return 'ai_ml';
  } else if (combined.includes('software') || combined.includes('backend') || combined.includes('frontend') || combined.includes('full stack')) {
    return 'software_engineer';
  } else if (combined.includes('data analyst') || combined.includes('analytics') || combined.includes('business intelligence')) {
    return 'data_analyst';
  }
  return 'software_engineer'; // Default
}

/**
 * Evaluate a single job using Claude API
 */
async function evaluateJob(job, trackOverride = null) {
  const jobTrack = trackOverride || determineJobTrack(job.title, job.description || '');
  const resume = RESUMES[jobTrack];h

  const prompt = `
You are an expert career coach and resume writer. Evaluate this job posting and provide:

1. FIT SCORE (0-100): How well does this match my experience?
2. DECISION: APPLY, MAYBE, or SKIP
3. 3 RESUME BULLETS: Tailored bullet points from my background that match this job
4. COLD EMAIL DRAFT: A short, professional 3-sentence email to reach out to a recruiter/hiring manager

JOB DETAILS:
Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Description: ${job.description || 'N/A'}
Requirements: ${job.requirements || 'N/A'}
Link: ${job.link || 'N/A'}

MY RESUME (${jobTrack.toUpperCase()} TRACK):
${resume}

Format your response as JSON:
{
  "fit_score": 85,
  "decision": "APPLY",
  "resume_bullets": [
    "Bullet 1",
    "Bullet 2",
    "Bullet 3"
  ],
  "cold_email": "Dear [Hiring Manager],\n\n...",
  "reasoning": "Why this score and decision"
}

IMPORTANT: Be honest about fit. Only recommend APPLY if fit score is 75+.
`;

  try {
    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const responseText = message.content[0].text;
    
    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from Claude response');
    }

    const evaluation = JSON.parse(jsonMatch[0]);
    
    return {
      job_id: job.id,
      job_title: job.title,
      company: job.company,
      track: jobTrack,
      fit_score: evaluation.fit_score,
      decision: evaluation.decision,
      resume_bullets: evaluation.resume_bullets,
      cold_email: evaluation.cold_email,
      reasoning: evaluation.reasoning,
      job_link: job.link,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error(`❌ Error evaluating ${job.title} at ${job.company}:`, error.message);
    return null;
  }
}

/**
 * Evaluate all jobs from the fetch step
 */
async function evaluateAllJobs(jobsFile = './jobs-to-evaluate.json') {
  if (!fs.existsSync(jobsFile)) {
    console.error(`❌ Jobs file not found: ${jobsFile}`);
    console.log('Run "npm run fetch" first\n');
    process.exit(1);
  }

  const jobsData = JSON.parse(fs.readFileSync(jobsFile, 'utf-8'));
  const evaluations = [];

  console.log(`📊 Evaluating ${jobsData.length} jobs with Claude...\n`);

  for (let i = 0; i < jobsData.length; i++) {
    const job = jobsData[i];
    console.log(`[${i + 1}/${jobsData.length}] Evaluating: ${job.title} at ${job.company}`);

    const evaluation = await evaluateJob(job);
    if (evaluation) {
      evaluations.push(evaluation);
      console.log(`   ✓ Fit Score: ${evaluation.fit_score}/100 | Decision: ${evaluation.decision}`);
    }

    // Rate limiting: wait 1 second between API calls
    if (i < jobsData.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return evaluations;
}

/**
 * Save evaluations to file
 */
function saveEvaluations(evaluations, filename = './job-evaluations.json') {
  fs.writeFileSync(filename, JSON.stringify(evaluations, null, 2));
  console.log(`\n💾 Saved evaluations to ${filename}`);
}

/**
 * Generate summary report
 */
function generateSummary(evaluations) {
  const applyCount = evaluations.filter(e => e.decision === 'APPLY').length;
  const maybeCount = evaluations.filter(e => e.decision === 'MAYBE').length;
  const skipCount = evaluations.filter(e => e.decision === 'SKIP').length;
  const avgScore = Math.round(evaluations.reduce((sum, e) => sum + e.fit_score, 0) / evaluations.length);

  console.log('\n📈 EVALUATION SUMMARY:');
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Total Jobs Evaluated: ${evaluations.length}`);
  console.log(`Average Fit Score: ${avgScore}/100`);
  console.log(`\n✅ APPLY: ${applyCount} jobs`);
  console.log(`⚠️  MAYBE: ${maybeCount} jobs`);
  console.log(`❌ SKIP: ${skipCount} jobs`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  const topJobs = evaluations.filter(e => e.decision === 'APPLY').sort((a, b) => b.fit_score - a.fit_score);
  if (topJobs.length > 0) {
    console.log('🎯 TOP MATCHES (APPLY):');
    topJobs.slice(0, 5).forEach(job => {
      console.log(`   • ${job.job_title} at ${job.company} (Score: ${job.fit_score}/100)`);
    });
  }

  console.log('\nNext step: Run "npm run upload" to save results to Google Sheets\n');
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('🤖 Starting job evaluation with Claude...\n');
    const evaluations = await evaluateAllJobs();
    
    if (evaluations.length === 0) {
      console.error('❌ No evaluations completed');
      process.exit(1);
    }

    saveEvaluations(evaluations);
    generateSummary(evaluations);

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

main();

export { evaluateJob, evaluateAllJobs, saveEvaluations };
