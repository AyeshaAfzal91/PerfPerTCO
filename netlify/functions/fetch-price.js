exports.handler = async function(event, context) {
  const gpuName = event.queryStringParameters.gpu || 'H100';

  const deltaPages = {
    "H100": "https://www.deltacomputer.com/nvidia-h100-80gb.html",
    "GH200": "https://www.deltacomputer.com/d14n-m2-gh-edu.html",
    "A100": "Not Available",
    "A40": "Not Available",
    "L4": "https://www.deltacomputer.com/nvidia-l4.html",
    "L40": "Not Available",
    "L40S": "https://www.deltacomputer.com/nvidia-l40s-48gb-edu-startup.html"
  };

// Used when fetching live price fails
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

  if (!targetURL) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "GPU not recognized." })
    };
  }

  // If Delta page is "Not Available", fallback to static price
  if (targetURL === "Not Available") {
    return {
      statusCode: 200,
      body: JSON.stringify({ gpu: gpuName, price: staticPrices[gpuName] })
    };
  }

  try {
    const res = await fetch(targetURL);
    const html = await res.text();

    // VERY basic parsing: look for € price format
    const match = html.match(/(\d{1,3}(\.\d{3})*,\d{2})\s*€/);

    if (!match) {
      // No price found, fallback to static
      return {
        statusCode: 200,
        body: JSON.stringify({ gpu: gpuName, price: staticPrices[gpuName] })
      };
    }

    const priceRaw = match[1];
    const normalizedPrice = parseFloat(priceRaw.replace('.', '').replace(',', '.'));

    return {
      statusCode: 200,
      body: JSON.stringify({ gpu: gpuName, price: normalizedPrice })
    };
  } catch (err) {
    // Fetch error (maybe website offline), fallback to static
    return {
      statusCode: 200,
      body: JSON.stringify({ gpu: gpuName, price: staticPrices[gpuName] })
    };
  }
};
