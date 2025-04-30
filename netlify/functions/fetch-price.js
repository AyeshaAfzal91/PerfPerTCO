exports.handler = async function (event, context) {
  const gpuName = event.queryStringParameters.gpu || 'H100';
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
  console.log("---LOG--- fetch-price.js - Target URL:", targetURL);

  if (!targetURL) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "GPU not recognized." })
    };
  }

  if (targetURL === "Not Available") {
    return {
      statusCode: 200,
      body: JSON.stringify({ gpu: gpuName, price: staticPrices[gpuName], source: "static" })
    };
  }

  try {
    const res = await fetch(targetURL);
    console.log("---LOG--- fetch-price.js - Response Status:", res.status);

    const html = await res.text();
    console.log("---LOG--- fetch-price.js - HTML snippet:", html.substring(0, 300));

    const match = html.match(/(\d{1,3}(?:\.\d{3})*,\d{2})\s*€/);
    if (!match) {
      console.warn("---LOG--- fetch-price.js - No price match found. Using static fallback.");
      return {
        statusCode: 200,
        body: JSON.stringify({ gpu: gpuName, price: staticPrices[gpuName], source: "static" })
      };
    }

    const priceRaw = match[1];
    const normalized = parseFloat(priceRaw.replace(/\./g, '').replace(',', '.'));

    return {
      statusCode: 200,
      body: JSON.stringify({ gpu: gpuName, price: normalized, source: "live" })
    };
  } catch (err) {
    console.error("---LOG--- fetch-price.js - Error fetching from Delta site:", err.message);
    return {
      statusCode: 200,
      body: JSON.stringify({ gpu: gpuName, price: staticPrices[gpuName], source: "static" })
    };
  }
};
