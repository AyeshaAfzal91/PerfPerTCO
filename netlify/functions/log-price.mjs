import { Octokit } from "@octokit/rest";

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { gpu, livePrice, staticPrice } = JSON.parse(event.body);
  const date = new Date().toISOString().split('T')[0];

  const octokit = new Octokit({ auth: process.env.MY_GITHUB_TOKEN });

  const owner = "AyeshaAfzal91";
  const repo = "Wattlytics";
  const path = "data/prices.json";

  try {
    const { data: file } = await octokit.repos.getContent({ owner, repo, path });
    const content = Buffer.from(file.content, 'base64').toString();
    const json = Array.isArray(JSON.parse(content)) ? JSON.parse(content) : [];

    json.push({ date, gpu, livePrice, staticPrice });

    const updatedContent = Buffer.from(JSON.stringify(json, null, 2)).toString('base64');

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: `Log ${gpu} price on ${date}`,
      content: updatedContent,
      sha: file.sha,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ status: "logged", gpu, date }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
