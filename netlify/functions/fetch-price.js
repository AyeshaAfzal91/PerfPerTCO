/*
fetch-price.js — scrapes the live GPU price from Delta’s website.
log-price.js (invoked at the end of fetch-price.js) — presumably logs the result to a file (should be data/prices.json).
price-history.mjs — reads from prices.json and computes percentage difference.
*/

export async function handler(event) {
  const gpuName = event.queryStringParameters?.gpu || 'H100';
  console.log("---LOG--- fetch-price.js - Received gpuName:", gpuName);

  const deltaPages = {
    "H100": "https://www.deltacomputer.com/nvidia-h100-80gb.html",
    "GH200": "https://www.deltacomputer.com/d14n-m2-gh-edu.html",
    "A100": "Not Available",
    "A40": "Not Available",
    "L4": "https://www.deltacomputer.com/nvidia-l4.html",
    "L40": "https://www.deltacomputer.com/nvidia-l40s-48gb-edu-startup.html",
    "L40S": "https://www.deltacomputer.com/nvidia-l40s-48gb-edu-startup.html"
  };

  const staticPrices = {
    "H100": 25818,
    "GH200": 25000,
    "A100": 7264,
    "A40": 4275,
    "L4": 2200,
    "L40": 6024,
    "L40S": 6100
  };

  const targetURL = deltaPages[gpuName];
  const staticPrice = staticPrices[gpuName];

  if (!targetURL) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "GPU not recognized." })
    };
  }

  if (targetURL === "Not Available") {
    return {
      statusCode: 200,
      body: JSON.stringify({ gpu: gpuName, price: staticPrice, source: "static" })
    };
  }

  try {
    const res = await fetch(targetURL);
    const html = await res.text();
    const match = html.match(/(\d{1,3}(?:\.\d{3})*,\d{2})\s*€/);

    let normalized;

    if (match) {
      const priceRaw = match[1];
      normalized = parseFloat(priceRaw.replace(/\./g, '').replace(',', '.'));
    } else {
      console.warn("---LOG--- No price match found. Using static fallback.");
      return {
        statusCode: 200,
        body: JSON.stringify({ gpu: gpuName, price: staticPrice, source: "static" })
      };
    }

    // Log to GitHub
    const logRes = await fetch(`${process.env.URL}/.netlify/functions/log-price`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gpu: gpuName,
        livePrice: normalized,
        staticPrice: staticPrice
      })
    });

    if (!logRes.ok) console.warn("Logging failed:", await logRes.text());

    return {
      statusCode: 200,
      body: JSON.stringify({ gpu: gpuName, price: normalized, source: "live" })
    };
  } catch (err) {
    console.error("---LOG--- Error:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}

