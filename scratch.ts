import { analyzeRepository } from './src/lib/github';

async function main() {
  try {
    const data = await analyzeRepository("sauravbhojak", "hrms-system");
    console.log("Details Language:", data.details.language);
    console.log("Languages:", data.languages);
    console.log("PRs:", data.pullRequests);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
