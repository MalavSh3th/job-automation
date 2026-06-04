import fs from 'fs';
import csv from 'csv-parser';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Fetch jobs from career-ops output CSV
 * Filters for past 24 hours and US locations
 */
async function fetchJobsFromCareerOps() {
  const careerOpsPath = process.env.CAREER_OPS_OUTPUT_PATH || './career-ops-results.csv';
  
  return new Promise((resolve, reject) => {
    const jobs = [];
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    if (!fs.existsSync(careerOpsPath)) {
      console.warn(`⚠️  Career-ops file not found at: ${careerOpsPath}`);
      console.log('📝 Make sure to run career-ops first and save output as career-ops-results.csv');
      resolve([]);
      return;
    }

    fs.createReadStream(careerOpsPath)
      .pipe(csv())
      .on('data', (row) => {
        try {
          // Parse job posting date (adjust based on your career-ops CSV format)
          const postedDate = new Date(row.posted_date || row.date_posted);
          
          // Filter: Past 24 hours + US location
          if (postedDate >= oneDayAgo && row.location?.includes('US')) {
            jobs.push({
              id: row.job_id || `${row.title}-${row.company}`,
              title: row.title,
              company: row.company,
              location: row.location,
              link: row.link || row.url,
              description: row.description,
              requirements: row.requirements,
              salary: row.salary,
              posted_date: row.posted_date,
              source: 'career-ops'
            });
          }
        } catch (err) {
          console.error('Error parsing job row:', err.message);
        }
      })
      .on('end', () => {
        console.log(`✅ Fetched ${jobs.length} jobs from past 24 hours`);
        resolve(jobs);
      })
      .on('error', (err) => {
        console.error('❌ Error reading CSV:', err.message);
        reject(err);
      });
  });
}

/**
 * Save fetched jobs to a JSON file for next step
 */
async function saveJobsToFile(jobs, filename = './jobs-to-evaluate.json') {
  fs.writeFileSync(filename, JSON.stringify(jobs, null, 2));
  console.log(`💾 Saved ${jobs.length} jobs to ${filename}`);
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('🔍 Fetching jobs from career-ops...\n');
    const jobs = await fetchJobsFromCareerOps();
    
    if (jobs.length === 0) {
      console.log('\n⚠️  No jobs found. Did you run career-ops yet?');
      console.log('Steps:');
      console.log('1. Run your career-ops pipeline');
      console.log('2. Export results to career-ops-results.csv');
      console.log('3. Run this script again\n');
      process.exit(0);
    }

    await saveJobsToFile(jobs);
    
    console.log('\n✨ Jobs fetched and saved!');
    console.log(`📊 Ready for evaluation: ${jobs.length} jobs found`);
    console.log('\nNext step: Run "npm run evaluate"\n');
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

main();

export { fetchJobsFromCareerOps, saveJobsToFile };
