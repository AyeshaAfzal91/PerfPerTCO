import { Octokit } from "@octokit/rest";

export async function handler() {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  const owner = "AyeshaAfzal91";  
  const repo = "PerfPerTCO";     
  const path = "data/prices.json";

  try {
    const { data: file } = await octokit.repos.getContent({ owner, repo, path });

    const content = Buffer.from(file.content, 'base64').toString();
    const entries = JSON.parse(content);

    const enriched = entries.map(entry => ({
      ...entry,
      percentDiff: parseFloat(
        (((entry.livePrice - entry.staticPrice) / entry.staticPrice) * 100).toFixed(2)
      )
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(enriched)
    };
  } catch (error) {
    console.error("Error in price-history.mjs:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}
