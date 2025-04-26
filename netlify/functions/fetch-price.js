const fetch = require('node-fetch'); // Netlify provides it

exports.handler = async function(event, context) {
  const gpuName = event.queryStringParameters.gpu || 'H100';

  const deltaPages = {
    "H100": "https://www.deltacomputer.com/nvidia-h100-80gb.html",
    "GH200": "https://www.deltacomputer.com/d14n-m2-gh-edu.html", // Example
    "A100": "https://www.deltacomputer.com/nvidia-l4.html",
    "A40": "https://www.deltacomputer.com/nvidia-l4.html",
    "L4": "https://www.deltacomputer.com/nvidia-l4.html",
    "L40": "https://www.deltacomputer.com/nvidia-l40s-48gb-edu-startup.html",
    "L40S": "https://www.deltacomputer.com/nvidia-l40s-48gb-edu-startup.html"
  };

  if (!deltaPages[gpuName]) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "GPU not supported." })
    };
  }

  try {
    const res = await fetch(deltaPages[gpuName]);
    const html = await res.text();

    // VERY basic parsing: look for € or Price keyword
    const match = html.match(/(\d{1,3}(\.\d{3})*,\d{2})\s*€/);

    if (!match) {
      return { statusCode: 404, body: "Price not found." };
    }

    const priceRaw = match[1];
    const normalizedPrice = parseFloat(priceRaw.replace('.', '').replace(',', '.'));

    return {
      statusCode: 200,
      body: JSON.stringify({ gpu: gpuName, price: normalizedPrice })
    };
  } catch (err) {
    return { statusCode: 500, body: "Server error: " + err.toString() };
  }
};
