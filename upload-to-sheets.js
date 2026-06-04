import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Convert evaluations to CSV format (alternative to Google Sheets)
 * Use this while you set up Google Sheets authentication
 */
async function exportToCSV(evaluations, filename = './job-evaluations-results.csv') {
  const headers = [
    'Job Title',
    'Company',
    'Fit Score',
    'Decision',
    'Track',
    'Resume Bullet 1',
    'Resume Bullet 2',
    'Resume Bullet 3',
    'Cold Email',
    'Reasoning',
    'Job Link',
    'Timestamp'
  ];

  const rows = evaluations.map(e => [
    `"${e.job_title}"`,
    `"${e.company}"`,
    e.fit_score,
    e.decision,
    e.track,
    `"${e.resume_bullets[0] || ''}"`,
    `"${e.resume_bullets[1] || ''}"`,
    `"${e.resume_bullets[2] || ''}"`,
    `"${e.cold_email.replace(/"/g, '""')}"`,
    `"${e.reasoning.replace(/"/g, '""')}"`,
    `"${e.job_link}"`,
    e.timestamp
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  fs.writeFileSync(filename, csvContent);
  console.log(`✅ Exported to CSV: ${filename}`);
  console.log(`📊 Open in Excel, Google Sheets, or any spreadsheet app`);
}

/**
 * Export to markdown for easy reading
 */
async function exportToMarkdown(evaluations, filename = './job-evaluations-results.md') {
  let md = '# Job Evaluation Results\n\n';
  md += `Generated: ${new Date().toLocaleString()}\n\n`;
  md += `**Total Jobs:** ${evaluations.length}\n`;
  md += `**Apply:** ${evaluations.filter(e => e.decision === 'APPLY').length} | `;
  md += `**Maybe:** ${evaluations.filter(e => e.decision === 'MAYBE').length} | `;
  md += `**Skip:** ${evaluations.filter(e => e.decision === 'SKIP').length}\n\n`;

  md += '---\n\n';

  // Sort by decision and fit score
  const sorted = evaluations.sort((a, b) => {
    const decisionOrder = { 'APPLY': 1, 'MAYBE': 2, 'SKIP': 3 };
    if (decisionOrder[a.decision] !== decisionOrder[b.decision]) {
      return decisionOrder[a.decision] - decisionOrder[b.decision];
    }
    return b.fit_score - a.fit_score;
  });

  sorted.forEach((job, index) => {
    const emojiMap = { 'APPLY': '✅', 'MAYBE': '⚠️ ', 'SKIP': '❌' };
    
    md += `## ${index + 1}. ${job.job_title} at ${job.company}\n\n`;
    md += `**Status:** ${emojiMap[job.decision]} ${job.decision}\n`;
    md += `**Fit Score:** ${job.fit_score}/100\n`;
    md += `**Track:** ${job.track.replace('_', ' ').toUpperCase()}\n`;
    md += `**Link:** [View Job](${job.job_link})\n\n`;

    md += `### Resume Bullets\n`;
    job.resume_bullets.forEach((bullet, i) => {
      md += `${i + 1}. ${bullet}\n`;
    });

    md += `\n### Cold Email Draft\n`;
    md += `\`\`\`\n${job.cold_email}\n\`\`\`\n`;

    md += `\n### Analysis\n`;
    md += `${job.reasoning}\n\n`;
    md += `---\n\n`;
  });

  fs.writeFileSync(filename, md);
  console.log(`✅ Exported to Markdown: ${filename}`);
}

/**
 * Main export function
 */
async function exportResults(evaluationsFile = './job-evaluations.json') {
  if (!fs.existsSync(evaluationsFile)) {
    console.error(`❌ Evaluations file not found: ${evaluationsFile}`);
    console.log('Run "npm run evaluate" first\n');
    process.exit(1);
  }

  const evaluations = JSON.parse(fs.readFileSync(evaluationsFile, 'utf-8'));

  console.log('📤 Exporting results...\n');

  // Export as CSV (default - works everywhere)
  await exportToCSV(evaluations);

  // Export as Markdown (for easy reading)
  await exportToMarkdown(evaluations);

  console.log('\n📌 NEXT STEPS:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('1. Open job-evaluations-results.csv in Excel or Google Sheets');
  console.log('2. Review the evaluations and decisions');
  console.log('3. For APPLY jobs: Copy cold email drafts to send to recruiters');
  console.log('4. Use resume bullets to customize your applications');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Optional: Google Sheets integration setup instructions
  if (process.env.GOOGLE_SHEET_ID) {
    console.log('💡 Google Sheets integration available!');
    console.log('   Update .env with GOOGLE_SERVICE_ACCOUNT_* credentials to auto-sync');
  } else {
    console.log('\n💡 OPTIONAL: Set up Google Sheets auto-sync:');
    console.log('   1. Go to https://console.cloud.google.com/');
    console.log('   2. Create service account and download JSON key');
    console.log('   3. Add credentials to .env file');
    console.log('   4. Create a Google Sheet and share with service account email');
    console.log('   5. Run "npm run upload" to auto-sync results\n');
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    await exportResults();
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

main();

export { exportToCSV, exportToMarkdown, exportResults };
