import { submitAnalysis } from './src/app/actions';
import 'dotenv/config';

async function main() {
  try {
    console.log("Submitting analysis...");
    const res = await submitAnalysis("https://github.com/EbookFoundation/free-programming-books");
    console.log("Success:", res);
  } catch (e) {
    console.error("Error:", e);
  }
}
main();
