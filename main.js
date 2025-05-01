/*!
 * Author: Ayesha Afzal <ayesha.afzal@fau.de>
 * © 2025 NHR@HPC, FAU Erlangen-Nuremberg. All rights reserved.
 */

async function updateGPUPrices() {
    document.getElementById('loading-spinner').style.display = 'block'; // Show spinner
    const gpuNames = ["H100", "GH200", "A100", "A40", "L4", "L40", "L40S"];
    const updatedPrices = {};

    try {
        // 🔁 Fetch latest prices
        for (const gpu of gpuNames) {
            const response = await fetch(`/.netlify/functions/fetch-price?gpu=${gpu}`);
            console.log(`---LOG--- updateGPUPrices - ${gpu} Response Status:`, response.status);
            const data = await response.json();
            console.log(`---LOG--- updateGPUPrices - ${gpu} Raw Data:`, JSON.stringify(data));
            if (data.price) {
                updatedPrices[gpu] = data.price;
            }
        }

        // ✅ Apply the updates to activeGPUData (after old prices are saved elsewhere)
        activeGPUData.forEach(gpu => {
            if (updatedPrices[gpu.name]) {
                gpu.cost = updatedPrices[gpu.name] * 1.19; // Add VAT
                gpu.priceSource = "Live";
            }
        });

        console.log("---LOG--- updateGPUPrices - Updated GPU prices:", updatedPrices);
        localStorage.setItem('cachedGPUPrices', JSON.stringify(updatedPrices));
        localStorage.setItem('cacheTimestamp', Date.now());

        const now = new Date();
        document.getElementById('last-updated').innerText = "Last Updated: " + now.toLocaleString();

    } catch (error) {
        console.error("---LOG--- updateGPUPrices - Failed to fetch live GPU prices:", error);
        loadCachedGPUPrices();
    } finally {
        document.getElementById('loading-spinner').style.display = 'none'; // Hide spinner
    }
}


function maybeRefreshGPUPrices() {
  // Show the spinner and hide the "Last Updated" message during the refresh
  document.getElementById('loading-spinner').style.display = 'inline-block';
  document.getElementById('last-updated').style.display = 'none';
  
  // Show the refresh container
  document.getElementById('refresh-container').style.display = 'block';
  
  // Simulate GPU price refresh (replace with actual refresh logic)
  setTimeout(function() {
    // Hide the spinner and show the "Last Updated" message after the refresh
    document.getElementById('loading-spinner').style.display = 'none';
    document.getElementById('last-updated').style.display = 'inline-block';
    document.getElementById('last-updated').innerText = 'Last Updated: ' + new Date().toLocaleString();
  }, 3000); // Simulate a 3-second delay for the refresh (replace with actual logic)
}


let selectedPriceSource = "static"; // default
let oldGPUPrices = {}; // Old prices snapshot before switching

async function handlePriceSourceChange() {
    console.log("---LOG--- handlePriceSourceChange - Start. selectedPriceSource:", selectedPriceSource);
    console.log("---LOG--- handlePriceSourceChange - activeGPUData before loading:", JSON.stringify(activeGPUData.map(g => ({ name: g.name, cost: g.cost, priceSource: g.priceSource }))));

    if (selectedPriceSource === "live") {
        await loadCachedGPUPrices();
    } else {
        await loadStaticGPUPrices();
    }

    console.log("---LOG--- handlePriceSourceChange - Before saveOldGPUPrices - selectedPriceSource:", selectedPriceSource, "activeGPUData:", JSON.stringify(activeGPUData.map(g => ({ name: g.name, cost: g.cost, priceSource: g.priceSource }))));
    saveOldGPUPrices();
    console.log("---LOG--- handlePriceSourceChange - After saveOldGPUPrices - oldGPUPrices:", JSON.stringify(oldGPUPrices));

    // 🧭 Step 1: Get the newly selected price source
    const radios = document.getElementsByName('priceSource');
    for (const radio of radios) {
        if (radio.checked) {
            selectedPriceSource = radio.value;
            break;
        }
    }
    console.log("---LOG--- handlePriceSourceChange - New selectedPriceSource:", selectedPriceSource);

    // 🔄 Step 2: Load the new prices
    await updatePricesAccordingToSelection();
    console.log("---LOG--- handlePriceSourceChange - activeGPUData after update according to selection:", JSON.stringify(activeGPUData.map(g => ({ name: g.name, cost: g.cost, priceSource: g.priceSource }))));

    // 📊 Step 3: Compare old vs new
    compareOldAndNewPrices();
    console.log("---LOG--- handlePriceSourceChange - End.");
}


function saveOldGPUPrices() {
    oldGPUPrices = {};
    activeGPUData.forEach(gpu => {
        oldGPUPrices[gpu.name] = {
            cost: gpu.cost,
            source: gpu.priceSource || "Static"
        };
    });
    console.log("---LOG--- saveOldGPUPrices - Saved old prices:", JSON.stringify(oldGPUPrices));
}

async function updatePricesAccordingToSelection() {
  console.log("---LOG--- updatePricesAccordingToSelection - Start. selectedPriceSource:", selectedPriceSource);
  if (selectedPriceSource === "live") {
    const cached = localStorage.getItem('cachedGPUPrices');
    if (cached) {
      console.log("Cached prices found. Loading from cache...");
      loadCachedGPUPrices();
    } else {
      console.log("No cache found. Fetching live prices now...");
      await updateGPUPrices();  
      loadCachedGPUPrices();    
    }
  } else {
    loadStaticGPUPrices();
  }
  console.log("---LOG--- updatePricesAccordingToSelection - End.");
}


function loadStaticGPUPrices() {
    console.log("---LOG--- loadStaticGPUPrices - Start. activeGPUData before:", JSON.stringify(activeGPUData.map(g => ({ name: g.name, cost: g.cost, priceSource: g.priceSource }))));
    activeGPUData.forEach(gpu => {
        switch (gpu.name) {
            case "H100":
                gpu.cost = 25818 * 1.19;
                break;
            case "GH200":
                gpu.cost = 25000 * 1.19;
                break;
            case "A100":
                gpu.cost = 7264 * 1.19;
                break;
            case "A40":
                gpu.cost = 4275 * 1.19;
                break;
            case "L4":
                gpu.cost = 2200 * 1.19;
                break;
            case "L40":
                gpu.cost = 6024 * 1.19;
                break;
            case "L40S":
                gpu.cost = 6100 * 1.19;
                break;
        }
        gpu.priceSource = "Static";
    });
    console.log("---LOG--- loadStaticGPUPrices - End. activeGPUData after:", JSON.stringify(activeGPUData.map(g => ({ name: g.name, cost: g.cost, priceSource: g.priceSource }))));
}

function loadCachedGPUPrices() {
    console.log("---LOG--- loadCachedGPUPrices - Start. activeGPUData before:", JSON.stringify(activeGPUData.map(g => ({ name: g.name, cost: g.cost, priceSource: g.priceSource }))));
    const cached = localStorage.getItem('cachedGPUPrices');
    if (cached) {
        const parsed = JSON.parse(cached);
        activeGPUData.forEach(gpu => {
            if (parsed[gpu.name]) {
                gpu.cost = parsed[gpu.name] * 1.19;
                gpu.priceSource = "Live";
            } else {
                gpu.priceSource = "Live"; // Mark as attempting live even if no specific cached price
            }
        });
        console.log("---LOG--- loadCachedGPUPrices - End. activeGPUData after (cache found):", JSON.stringify(activeGPUData.map(g => ({ name: g.name, cost: g.cost, priceSource: g.priceSource }))));
    } else {
        activeGPUData.forEach(gpu => {
            gpu.priceSource = "Live"; // Mark as attempting live even if no cache
        });
        console.log("---LOG--- loadCachedGPUPrices - No cached prices found. Marking as 'Live'.");
        // Optionally, you could call updateGPUPrices() here if you want to force a fetch when no cache.
    }
}

function compareOldAndNewPrices() {
    console.log("---LOG--- compareOldAndNewPrices - Start. oldGPUPrices:", JSON.stringify(oldGPUPrices), "activeGPUData:", JSON.stringify(activeGPUData.map(g => ({ name: g.name, cost: g.cost, priceSource: g.priceSource }))));
    const list = document.getElementById('price-difference-list');
    list.innerHTML = '';

    activeGPUData.forEach(gpu => {
        const old = oldGPUPrices[gpu.name];
        const current = gpu;

        if (!old) {
            console.warn(`---LOG--- compareOldAndNewPrices - No old price found for ${gpu.name}`);
            return;
        }

        const oldCost = old.cost;
        const newCost = current.cost;
        const oldSource = old.source;
        const newSource = current.priceSource;

        const listItem = document.createElement('li');
        listItem.style.marginBottom = '8px';

        const priceDiff = Math.abs(newCost - oldCost);
        const threshold = 0.01; // negligible price difference

        if (priceDiff < threshold) {
            listItem.innerHTML = `➖ <strong>${gpu.name}</strong>: No change (Old: ${oldCost.toFixed(2)} € ${oldSource}, New: ${newCost.toFixed(1)} € ${newSource})`;
            listItem.style.color = 'gray';
        } else if (newCost > oldCost) {
            const percentChange = ((newCost - oldCost) / oldCost) * 100;
            listItem.innerHTML = `📈 <strong>${gpu.name}</strong>: +${percentChange.toFixed(2)}% € more expensive (Old: ${oldCost.toFixed(1)} ${oldSource}, New: ${newCost.toFixed(1)} € ${newSource})`;
            listItem.style.color = 'red';
        } else {
            const percentChange = ((oldCost - newCost) / oldCost) * 100;
            listItem.innerHTML = `📉 <strong>${gpu.name}</strong>: -${percentChange.toFixed(2)}% € cheaper (Old: ${oldCost.toFixed(1)} ${oldSource}, New: ${newCost.toFixed(1)} € ${newSource})`;
            listItem.style.color = 'green';
        }

        list.appendChild(listItem);
    });
    console.log("---LOG--- compareOldAndNewPrices - End.");
}

const presetProfiles = {
  Alex: { // (44 A40-40GB + 20 A100-40GB + 18 A100-80GB) nodes; 8 x (44 + 20 + 18) GPUs
    name: "NHR@FAU Alex Cluster (A100, A40)",
    sliders: {
      total_budget: 10000000,		  // (example estimate)
      C_node_server: 60000,           // A100 node: (40k€ for <50% of A100) / 53k€ / 73k€ / 78k€ (depending on the time without tax, network costs and cooling infrastructure, etc.). Let's take a mid-range value: €60k per A100 node.
      C_node_infrastructure: 15000,   // CDU + piping = €1.5 million per 100 nodes → €15k per node (significant infrastructure cost especially for warm water cooling)
      C_node_facility: 10000,         // (example estimate) 
      C_software: 5000,               // (example estimate) 
      C_electricityperkWh: 0.21,      // Typical rate in German universities
      PUE: 1.2,                       // Efficient cooling
      C_node_maintenance: 400,        // (example estimate)
      systemusage: 8760,              // Full utilization (24/7)
      lifetime: 5,                    // 5-year lifetime
      W_node_baseline: 800,           // Estimated baseline power per node
      C_depreciation: 0,              // Already included in infra estimates
      C_subscription: 0,              // No additional subscription
      C_uefficiency: 0,               // No unused efficiency cost
      C_heatreuseperkWh: 0,			  // No heat reuse
      Factor_heatreuse: 0			  // No heat reuse 
    },
    checkboxes: {
      sameGPUCount: false
    }
  },
  Helma: { // 96 nodes; 4 x 96 GPUs
    name: "NHR@FAU Helma Cluster (H100)",
    sliders: {
      total_budget: 10000000,		  // (example estimate)
      C_node_server: 140000,          // H100 node: range: <100k€ -- 200k€ (depending on the time without tax, network costs and cooling infrastructure, etc.). Let's take a mid-range value: €140k per Helma node. 
      C_node_infrastructure: 15000,   // CDU + piping = €1.5 million per 100 nodes → €15k per node (significant infrastructure cost especially for warm water cooling)
      C_node_facility: 10000,         // (example estimate) 
      C_software: 5000,               // (example estimate) 
      C_electricityperkWh: 0.21,      // Typical rate in German universities
      PUE: 1.2,                       // Efficient cooling
      C_node_maintenance: 400,        // (example estimate)
      systemusage: 8760,              // Full utilization (24/7)
      lifetime: 5,                    // 5-year lifetime
      W_node_baseline: 800,           // Estimated baseline power per node
      C_depreciation: 0,              // Already included in infra estimates
      C_subscription: 0,              // No additional subscription
      C_uefficiency: 0,               // No unused efficiency cost
      C_heatreuseperkWh: 0,			  // No heat reuse
      Factor_heatreuse: 0			  // No heat reuse 
    },
    checkboxes: {
      sameGPUCount: false
    }
  }
};


function applyPresetProfile() {
  const selected = document.getElementById("preset-profile").value;

  // Exit if no profile is selected or not found
  if (!selected || !presetProfiles[selected]) {
    console.log("⚠️ No valid profile selected.");
    return;
  }

  const profile = presetProfiles[selected];

  // Apply slider values
  Object.entries(profile.sliders).forEach(([id, value]) => {
    const input = document.getElementById(id);
    if (input) {
      input.value = value;
      input.dispatchEvent(new Event('input')); // Trigger UI update
    }
  });

  // Apply checkboxes
  Object.entries(profile.checkboxes || {}).forEach(([id, value]) => {
    const checkbox = document.getElementById(id);
    if (checkbox) checkbox.checked = value;
  });

  alert(`✅ '${profile.name}' profile applied. Click on "🧮 Calculate" now!`);
  // calculate(); // Run calculation immediately after applying
}


const activeGPUData = [
  {
    name: "H100",
    cost: 25818 * 1.19, // Final cost with VAT
    perf: {
      GROMACS: {
        1: 7175121.776, 2: 32936426.09, 3: 32150365.14, 4: 34908616.88, 5: 39107478.46, 6: 39948418.48, 7: 34908616.88,
      },
      AMBER: {
        1: 5152857.92, 2: 2008101.9, 3: 764401.92, 4: 88999126.29, 5: 95651280.81, 6: 29304738.52, 7: 30648251.26,
        8: 56972608.32, 9: 60495215.82, 10: 87373738.6, 11: 96913567.9,
      }
    },
    power: {
      GROMACS: {
        1: 271.9, 2: 326.3, 3: 355.5, 4: 400.5, 5: 425.6, 6: 439.3, 7: 700,
      },
      AMBER: {
        1: 252.01, 2: 573.56, 3: 124.73, 4: 440.27, 5: 463.97, 6: 204.46, 7: 204.28,
        8: 301.66, 9: 309.72, 10: 468.57, 11: 508.50,
      }
    },
    per_node: 4,
  },
  {
    name: "GH200",
    cost: 25000 * 1.19, // Final cost with VAT
    perf: {
      GROMACS: {
        1: 8331687.536, 2: 35826462.39, 3: 37781353.86, 4: 39618475.84, 5: 46166583.42, 6: 47407348.09, 7: 39618475.84,
      },
      AMBER: {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, // No data for GH200
      }
    },
    power: {
      GROMACS: {
        1: 287.6, 2: 272.8, 3: 373.8, 4: 412.7, 5: 443.7, 6: 459.7, 7: 1000,
      },
      AMBER: {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, // No data for GH200
      }
    },
    per_node: 4,
  },
  {
    name: "A100",
    cost: 7264 * 1.19, // Final cost with VAT
    perf: {
      GROMACS: {
        1: 5415894.544, 2: 22056600.85, 3: 21343385.45, 4: 21986097.84, 5: 23913249.3, 6: 24771368.67, 7: 21986097.84,
      },
      AMBER: {
        1: 4159496.88, 2: 1322004.6, 3: 732244.8, 4: 57887637.03, 5: 60911343.63, 6: 24677240.58, 7: 25543232.66,
        8: 43691241.72, 9: 45648447.9, 10: 53568169, 11: 57057569.65,
      }
    },
    power: {
      GROMACS: {
        1: 194.6, 2: 222.7, 3: 243.5, 4: 264.7, 5: 269.5, 6: 277.7, 7: 400,
      },
      AMBER: {
        1: 194.91, 2: 394.23, 3: 89.89, 4: 295.53, 5: 301.83, 6: 153.28, 7: 154.74,
        8: 227.15, 9: 229.95, 10: 303.63, 11: 315.16,
      }
    },
    per_node: 8,
  },
  {
    name: "A40",
    cost: 4275 * 1.19, // Final cost with VAT
    perf: {
      GROMACS: {
        1: 5608817.488, 2: 23336370.2, 3: 21524115.99, 4: 20825707.68, 5: 21470494.72, 6: 20312863.63, 7: 20825707.68,
      },
      AMBER: {
        1: 2986985.96, 2: 822112.2, 3: 634356.8, 4: 38511398.25, 5: 39696364.35, 6: 22049581.26, 7: 22714623.6,
        8: 36343309.74, 9: 37730535.3, 10: 35779695.35, 11: 37615098.75,
      }
    },
    power: {
      GROMACS: {
        1: 259.1, 2: 293.6, 3: 294.7, 4: 297.0, 5: 293.5, 6: 293.5, 7: 300,
      },
      AMBER: {
        1: 204.29, 2: 301.43, 3: 89.95, 4: 291.28, 5: 293.57, 6: 177.37, 7: 178.31,
        8: 265.41, 9: 269.51, 10: 289.73, 11: 294.80,
      }
    },
    per_node: 8,
  },
  {
    name: "L4",
    cost: 2200 * 1.19, // Final cost with VAT
    perf: {
      GROMACS: {
        1: 4067013.28, 2: 15579562.28, 3: 13645436.71, 4: 13243231.6, 5: 13411129.18, 6: 12778203.44, 7: 13243231.6,
      },
      AMBER: {
        1: 2925707.68, 2: 627876.9, 3: 672286.88, 4: 24046639.65, 5: 24426646.02, 6: 20572494.66, 7: 21182175.7,
        8: 25521859.5, 9: 26132747.82, 10: 20008031.25, 11: 20680301.1,
      }
    },
    power: {
      GROMACS: {
        1: 72.6, 2: 72.1, 3: 69.2, 4: 71.9, 5: 71.7, 6: 70.8, 7: 72,
      },
      AMBER: {
        1: 71.64, 2: 71.92, 3: 36.88, 4: 71.84, 5: 71.92, 6: 71.15, 7: 71.17,
        8: 71.82, 9: 72.16, 10: 71.75, 11: 71.76,
      }
    },
    per_node: 4,
  },
  {
    name: "L40",
    cost: 6024 * 1.19, // Final cost with VAT
    perf: {
      GROMACS: {
        1: 8425537.016, 2: 40010171.63, 3: 37199660.06, 4: 36117718.56, 5: 35575770.24, 6: 33759842.83, 7: 36117718.56,
      },
      AMBER: {
        1: 4719274.84, 2: 1901699.1, 3: 774212, 4: 70321608.9, 5: 70170423.57, 6: 31176657.2, 7: 32218863.12,
        8: 61876077.96, 9: 63979642.8, 10: 60002751.85, 11: 62136941.85,
      }
    },
    power: {
      GROMACS: {
        1: 228.1, 2: 288.2, 3: 286.9, 4: 301.3, 5: 292.1, 6: 288.1, 7: 300,
      },
      AMBER: {
        1: 175.60, 2: 299.83, 3: 96.77, 4: 293.18, 5: 298.80, 6: 166.42, 7: 169.23,
        8: 257.84, 9: 260.21, 10: 293.14, 11: 296.19,
      }
    },
    per_node: 8,
  },
  {
    name: "L40S",
    cost: 6100 * 1.19, // Final cost with VAT
    perf: {
      GROMACS: {
        1: 8207081.344, 2: 38895778.64, 3: 37932216.89, 4: 39030190.56, 5: 42052211.1, 6: 40459333.3, 7: 39030190.56,
      },
      AMBER: {
        1: 4781101.36, 2: 2168458.95, 3: 787819.04, 4: 76548810.06, 5: 79944350.85, 6: 30502427.24, 7: 32075159.32,
        8: 58465284.84, 9: 61167920.22, 10: 70759069.45, 11: 75966493.05,
      }
    },
    power: {
      GROMACS: {
        1: 231.5, 2: 287.6, 3: 291.4, 4: 313.8, 5: 321.4, 6: 324.9, 7: 350,
      },
      AMBER: {
        1: 181.27, 2: 349.30, 3: 100.01, 4: 319.54, 5: 326.77, 6: 164.55, 7: 174.51,
        8: 249.74, 9: 258.47, 10: 318.40, 11: 323.18,
      }
    },
    per_node: 8,
  }
];

if (typeof GPU_data === "undefined") {
  var GPU_data = [...activeGPUData];
}

function updateValue(spanId, val) {
  document.getElementById(spanId).innerText = val;
}

let previousState = null;  // Global variable to store previous input values

function resetForm() {
  previousState = {};  // Clear previous state

  const allInputs = [
    "workload", "benchmarkId", "total_budget", "sameGpuCheckbox",
    "C_node_server", "C_node_infra", "C_node_facility", "C_software",
    "C_electricity", "C_PUE", "C_maintenance", "system_usage", "lifetime",
    "W_node_baseline", "C_depreciation", "C_subscription", "C_uefficiency",
    "C_heatreuseperkWh", "Factor_heatreuse"
  ];

  allInputs.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    previousState[id] = (el.type === "checkbox") ? el.checked : el.value;
  });

  const defaultValues = {
    workload: "GROMACS", benchmarkId: 4, total_budget: 10000000, sameGpuCheckbox: false,
    C_node_server: 10000, C_node_infra: 5000, C_node_facility: 0, C_software: 5000,
    C_electricity: 0.21, C_PUE: 1.2, C_maintenance: 200, system_usage: 8760, lifetime: 5,
    W_node_baseline: 500, C_depreciation: 0, C_subscription: 0, C_uefficiency: 0,
    C_heatreuseperkWh: 0, Factor_heatreuse: 0
  };

  const spanMap = {
    benchmarkId: "benchmarkVal", total_budget: "v_budget",
    C_node_server: "v_node_server", C_node_infra: "v_node_infra", C_node_facility: "v_node_facility",
    C_software: "v_software", C_electricity: "v_electricity", C_PUE: "v_PUE", C_maintenance: "v_maintenance",
    system_usage: "v_usage", lifetime: "v_lifetime", W_node_baseline: "v_baseline",
    C_depreciation: "v_depreciation", C_subscription: "v_subscription", C_uefficiency: "v_uefficiency",
    C_heatreuseperkWh: "v_heatreuseperkWh", Factor_heatreuse: "v_Factor_heatreuse"
  };

  for (const id in defaultValues) {
    const el = document.getElementById(id);
    if (!el) continue;

    if (el.type === "checkbox") {
      el.checked = defaultValues[id];
    } else {
      el.value = defaultValues[id];
      if (spanMap[id]) {
        const span = document.getElementById(spanMap[id]);
        if (span) span.innerText = defaultValues[id];
      }
    }
  }

  // Clear outputs
  document.getElementById("resultsTable").innerHTML = "";
  document.getElementById("comparison-message-container").innerHTML = "";
  document.getElementById("gpu-chart").innerHTML = "";
  document.getElementById("stacked-tco-chart").innerHTML = "";
  document.getElementById("pie-tco-chart").innerHTML = "";
  document.getElementById("gpuTornadoPlots").innerHTML = "";
  document.getElementById("sensitivityHeatmap").innerHTML = "";
  document.getElementById("elasticityTableContainer").innerHTML = "";
  document.getElementById("blogOutput").value = "";
  document.getElementById("download-csv").style.display = "none";
  document.getElementById("download-elasticity-csv").style.display = "none";
  document.getElementById("gpuPerfPowerHeatmap").innerHTML = "";


  // Remove extra chart titles and download buttons
  const elementsToRemove = [
    "chart-title-perf-tco",
    "chart-title-tco-breakdown",
    "gpu-download-btn",
    "download-btn",
    "heatmap-download-btn",
    "download-pie-btn"
  ];

  elementsToRemove.forEach(id => {
    const el = document.getElementById(id);
    if (el && el.parentNode) {
      el.parentNode.removeChild(el);
    }
  });

  document.querySelectorAll(".chart-title").forEach(el => {
    if ([
      "Heatmap: Sensitivity of Parameters across GPUs",
      "Performance per TCO and GPU Count by GPU Type",
      "TCO Breakdown (Capital vs Operational costs)"
    ].includes(el.innerText.trim())) {
      el.remove();
    }
  });

document.getElementById("scenario-comparison").innerHTML = "";
localStorage.removeItem("scenario1");
localStorage.removeItem("scenario2");
  
  // Clear uploaded file input
const fileInput = document.getElementById("gpuConfigUploadMain");
if (fileInput) {
  fileInput.value = "";
  document.getElementById("uploadStatusMain").innerText = ""; // Clear any status text
}

// Reset preset profile selection dropdown
const presetSelect = document.getElementById("preset-profile");
if (presetSelect) presetSelect.value = "";

  showUndoToast("Calculator has been reset. ", restorePreviousState);
}

function restorePreviousState() {
  if (!previousState) return;

  const spanMap = {
    benchmarkId: "benchmarkVal", total_budget: "v_budget",
    C_node_server: "v_node_server", C_node_infra: "v_node_infra", C_node_facility: "v_node_facility",
    C_software: "v_software", C_electricity: "v_electricity", C_PUE: "v_PUE", C_maintenance: "v_maintenance",
    system_usage: "v_usage", lifetime: "v_lifetime", W_node_baseline: "v_baseline",
    C_depreciation: "v_depreciation", C_subscription: "v_subscription", C_uefficiency: "v_uefficiency",
    C_heatreuseperkWh: "v_heatreuseperkWh", Factor_heatreuse: "v_Factor_heatreuse"
  };

  for (const id in previousState) {
    const el = document.getElementById(id);
    if (!el) continue;

    if (el.type === "checkbox") {
      el.checked = previousState[id];
    } else {
      el.value = previousState[id];
      if (spanMap[id]) {
        const span = document.getElementById(spanMap[id]);
        if (span) span.innerText = previousState[id];
      }
    }
  }

  showToast("Previous values restored.");
}

function showUndoToast(message, undoCallback) {
  let toast = document.createElement("div");
  toast.className = "toast";

  const text = document.createElement("span");
  text.innerText = message;

  const undoBtn = document.createElement("button");
  undoBtn.innerText = "Undo";
  undoBtn.style.marginLeft = "12px";
  undoBtn.style.background = "#fff";
  undoBtn.style.color = "#007acc";
  undoBtn.style.border = "none";
  undoBtn.style.cursor = "pointer";
  undoBtn.style.fontWeight = "bold";
  undoBtn.onclick = () => {
    undoCallback();
    toast.classList.remove("show");
    setTimeout(() => document.body.removeChild(toast), 300);
  };

  toast.appendChild(text);
  toast.appendChild(undoBtn);
  document.body.appendChild(toast);

  // Trigger animation
  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => document.body.contains(toast) && document.body.removeChild(toast), 500);
  }, 8000);
}

function showToast(message) {
  let toast = document.createElement("div");
  toast.className = "toast";
  toast.innerText = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => document.body.contains(toast) && document.body.removeChild(toast), 500);
  }, 2000);
}

function getSliderValue(id) {
  return parseFloat(document.getElementById(id).value);
}

console.log("after getSliderValue: GPU_data used for calculation:", GPU_data.map(g => g.name));

function calculate() {
console.log("calculate: GPU_data used for calculation:", GPU_data.map(g => g.name));

  const workload = document.getElementById("workload").value;
  const same_n_gpu = document.getElementById("sameGpuCheckbox").checked;
  const benchmarkId = parseInt(document.getElementById("benchmarkId").value); // Get benchmarkId

  const C_node_server = getSliderValue("C_node_server");
  const C_node_infra = getSliderValue("C_node_infra");
  const C_node_facility = getSliderValue("C_node_facility");
  const C_software = getSliderValue("C_software");
  const C_electricity = getSliderValue("C_electricity");
  const PUE = getSliderValue("C_PUE");
  const C_maintenance = getSliderValue("C_maintenance");
  const system_usage = getSliderValue("system_usage");
  const lifetime = getSliderValue("lifetime");
  const W_node_baseline = getSliderValue("W_node_baseline");
  const C_depreciation = getSliderValue("C_depreciation");
  const C_subscription = getSliderValue("C_subscription");
  const C_uefficiency = getSliderValue("C_uefficiency");
  const C_heatreuseperkWh = getSliderValue("C_heatreuseperkWh");
  const F_heatreuse = getSliderValue("Factor_heatreuse");
  const total_budget = getSliderValue("total_budget");

if (workload === "GROMACS" && benchmarkId > 7) {
  alert("⚠️ GROMACS benchmark data is only available up to ID 7.\nPlease select a lower Benchmark ID.");
  return;
}

let baseline_perf_tco = 0;
window.results = [];
const capital_components = [];
const operational_components = [];

let min_valid_n_gpu = Infinity;

// ---------- Compute n_gpu ----------
const n_gpu_list = GPU_data.map((gpu, i) => {
  const perf = gpu.perf[workload][benchmarkId]; // Use workload and benchmarkId
  const power = gpu.power[workload][benchmarkId];
  if (perf === 0 || power === 0) return 0;

  const per_node = gpu.per_node;

  const W_gpu_total = power * system_usage * lifetime;
  const W_node_baseline_total = W_node_baseline * system_usage * lifetime;

  const A =
    gpu.cost +
    ((C_electricity - (F_heatreuse * C_heatreuseperkWh)) * PUE * W_gpu_total / 1000) +
    ((
      C_node_server +
      C_node_infra +
      C_node_facility +
      (C_maintenance * lifetime) +
      ((C_electricity - ( F_heatreuse * C_heatreuseperkWh)) * PUE * W_node_baseline_total / 1000)
    ) / per_node);

  const C_baseline = C_software + (lifetime * (C_depreciation + C_subscription + C_uefficiency));
  const B = total_budget - C_baseline;

  let n_gpu = Math.floor(B / A);

  n_gpu = Math.floor(n_gpu / per_node) * per_node; // Ensure n_gpu is a multiple of per_node
 
  if (n_gpu < per_node) {
    console.warn(`${gpu.name} cannot be deployed with the current budget.`);
    return 0;
  }

  // Update min_valid_n_gpu if same_n_gpu is true
  if (same_n_gpu) {
    min_valid_n_gpu = Math.min(min_valid_n_gpu, n_gpu);
    min_valid_n_gpu = Math.floor(min_valid_n_gpu / per_node) * per_node; // Ensure min_valid_n_gpu is valid multiple of per_node
  }

  console.log(`GPU: ${gpu.name}, A: ${A}, B: ${B}, n_gpu: ${n_gpu}`);
  return n_gpu;
});

// ---------- Compute cost breakdowns ----------
GPU_data.forEach((gpu, i) => {
  const perf = gpu.perf[workload][benchmarkId]; // Use workload and benchmarkId
  const power = gpu.power[workload][benchmarkId];
  if (perf === 0 || power === 0) return;

  let n_gpu = n_gpu_list[i];
  if (n_gpu === 0) return;

  // Ensure same_n_gpu is applied properly
  if (same_n_gpu) {
    n_gpu = min_valid_n_gpu;
  }

  const per_node = gpu.per_node;
  const n_nodes = n_gpu / per_node;

  const W_gpu_total = power * system_usage * lifetime;
  const W_node_baseline_total = W_node_baseline * system_usage * lifetime;

  // --- Capital Components ---
  const cap_gpu = gpu.cost * n_gpu;
  const cap_server = C_node_server * n_nodes;
  const cap_infra = C_node_infra * n_nodes;
  const cap_facility = C_node_facility * n_nodes;
  const cap_baseline = C_software;

  // --- Operational Components ---
  const energyandcooling = (C_electricity - ( F_heatreuse * C_heatreuseperkWh)) * PUE * ((W_node_baseline_total * n_nodes) + (W_gpu_total * n_gpu)) / 1000;
  const maintenance = lifetime * C_maintenance * n_nodes;
  const op_baseline = lifetime * (C_depreciation + C_subscription + C_uefficiency);

  // --- Totals ---
  const capital = cap_gpu + cap_server + cap_infra + cap_facility + cap_baseline;
  const operational = energyandcooling + maintenance + op_baseline;
  const used_budget = capital + operational;

  const baseline_pct = 100 * (cap_baseline + op_baseline) / used_budget;
  const total_perf = perf * n_gpu;
  const perf_per_tco = total_perf / used_budget;

  // Initialize baseline_perf_tco with the first valid perf_per_tco
  if (baseline_perf_tco === 0) baseline_perf_tco = perf_per_tco;

  // Push results for this GPU
  window.results.push({
    name: gpu.name,
    n_gpu,
    total_cost: used_budget,
    perf_per_tco,
    baseline_pct,
    capital,
    operational,
    capital_components: [cap_gpu, cap_server, cap_infra, cap_facility, cap_baseline],
    operational_components: [energyandcooling, maintenance, op_baseline],
    originalGPUIndex: i,
    performance: total_perf,
    power: power * n_gpu
  });

  capital_components.push([cap_gpu, cap_server, cap_infra, cap_facility, cap_baseline]);
  operational_components.push([energyandcooling, maintenance, op_baseline]);

  console.log(`GPU: ${gpu.name}, Total Cost: ${used_budget}, Perf/TCO: ${perf_per_tco}`);
});



// After loop, check if any valid GPU was found
if (baseline_perf_tco === 0 && window.results.length > 0) {
  baseline_perf_tco = window.results[0].perf_per_tco;
} else if (window.results.length === 0) {
  console.warn("No valid GPUs available.");
}


// ---------- Print HTML table and message ----------

// Function to calculate the heatmap color
function getHeatmapColor(value, maxValue) {
  const percentage = value / maxValue;
  const red = Math.floor((1 - percentage) * 255);
  const green = Math.floor(percentage * 255);
  return `rgb(${red}, ${green}, 0)`;
}

// Sort the results by Performance per TCO
window.results.sort((a, b) => b.perf_per_tco - a.perf_per_tco);

// Filter out GPUs with zero Performance per TCO
const nonzeroResults = window.results.filter(r => r.perf_per_tco > 0);

// Check if nonzeroResults is empty before calculating performance ratio
if (nonzeroResults.length === 0) {
  document.getElementById("comparison-message-container").innerHTML = '<p>No valid GPUs found.</p>';
  return;
}

const sortedResults = [...nonzeroResults].sort((a, b) => b.perf_per_tco - a.perf_per_tco);
window.bestResult = sortedResults[0];

// Find max and min among valid entries
const maxResult = nonzeroResults[0]; // Best GPU by Performance per TCO
const minResult = nonzeroResults[nonzeroResults.length - 1]; // Worst GPU by Performance per TCO

// Compute performance ratio
const performanceRatio = maxResult.perf_per_tco / minResult.perf_per_tco;

// Now let's append the comparison message to the screen below the table.
const comparisonMessageContainer = document.getElementById("comparison-message-container");

comparisonMessageContainer.classList.add('dark-message');

const comparisonMessage = `
  <p><strong>With the fixed budget of €${total_budget.toLocaleString()},</strong></p>
  <p>The ${maxResult.n_gpu} ${maxResult.name} GPUs (the highest Performance per TCO)</p>
  <p>delivers <strong>${performanceRatio.toFixed(1)} times more performance</strong> over its ${lifetime}-year lifetime</p>
  <p>compared to the ${minResult.n_gpu} ${minResult.name} GPUs (the lowest Performance per TCO).</p>
`;

comparisonMessageContainer.innerHTML = comparisonMessage;

// CSV download

document.getElementById('download-csv').style.display = 'block';
document.getElementById('download-elasticity-csv').style.display = 'block';
  
function downloadCSV2(data, filename = "gpu_tco_results.csv") {
  if (!Array.isArray(data) || data.length === 0) {
    console.error("Invalid data: must be a non-empty array.");
    return;
  }

  const headers = [
    "GPU",
    "#GPUs",
    "Total TCO (€)",
    "Perf/TCO (ns/day/€ * atoms)",
    "Baseline %"
  ];

  // Map over the data to format rows correctly
  const rows = data.map(r => [
    r.name,
    r.n_gpu,
    Math.round(r.total_cost),                // Ensure it's an integer
    r.perf_per_tco.toFixed(1),               // Format as a 1-decimal number
    r.baseline_pct.toFixed(2)                // Format as a 2-decimal percentage
  ]);

  // Join headers and rows into CSV content
  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");

  downloadCSV(csvContent, filename);
}

// Attach the download to a button
document.getElementById("download-csv").addEventListener("click", () => {
  downloadCSV2(window.results);
});

// Optional debug print
console.table(window.results.map(r => ({
  GPU: r.name,
  '#GPUs': r.n_gpu,
  'Total TCO (€)': `€${Math.round(r.total_cost).toLocaleString()}`,
  'Perf/TCO (ns/day/€ * atoms)': r.perf_per_tco.toFixed(1),
  'Baseline %': r.baseline_pct.toFixed(2)
})));

// Find the maximum values for each column to use in heatmap color calculation
const maxTotalCost = Math.max(...window.results.map(r => r.total_cost));
const maxPerfPerTCO = Math.max(...window.results.map(r => r.perf_per_tco));
const maxBaselinePct = Math.max(...window.results.map(r => r.baseline_pct));
const maxGPUs = Math.max(...window.results.map(r => r.n_gpu)); // Find the max number of GPUs

// Create the table HTML dynamically
const tableHTML = `
  <h3>Performance Per Total Cost of Ownership (TCO)</h3>
  <table border="1" cellpadding="6">
    <thead>
      <tr>
        <th>GPU</th>
        <th>#GPUs</th>
        <th>Total TCO (€)</th>
        <th>Perf/TCO (ns/day/€ * atoms)</th>
        <th>Baseline %</th>
      </tr>
    </thead>
    <tbody>
      ${window.results.map(r => `
        <tr>
          <td>${r.name}</td>
          <td style="background-color:${getHeatmapColor(r.n_gpu, maxGPUs)}">${r.n_gpu}</td>
          <td style="background-color:${getHeatmapColor(r.total_cost, maxTotalCost)}">€${r.total_cost.toFixed(0)}</td>
          <td style="background-color:${getHeatmapColor(r.perf_per_tco, maxPerfPerTCO)}">${r.perf_per_tco.toFixed(1)}</td>
          <td style="background-color:${getHeatmapColor(r.baseline_pct, maxBaselinePct)}">${(r.baseline_pct).toFixed(2)}%</td>
        </tr>`).join('')}
    </tbody>
  </table>`;

// Insert the table into the HTML container
document.getElementById("resultsTable").innerHTML = tableHTML;
 
// ---------- Plotly Bar Chart: Performance per TCO (Left Y-Axis) + #GPUs (Right Y-Axis) ----------
const barLabels = nonzeroResults.map(result => result.name);
const perfPerTCO = nonzeroResults.map(result => result.perf_per_tco);
const gpuCounts = nonzeroResults.map(result => result.n_gpu);

const barColors = 'rgba(51, 153, 255, 0.6)';
const barOutline = 'rgba(51, 153, 255, 1)';

// Trace 1: Performance per TCO (Left Y-axis)
const perfTrace = {
  x: barLabels,
  y: perfPerTCO,
  type: 'bar',
  name: 'Performance per TCO',
  marker: {
    color: barColors,
    line: {
      color: barOutline,
      width: 1
    }
  },
  yaxis: 'y1'
};

// Trace 2: GPU count as line (Right Y-axis)
const gpuTrace = {
  x: barLabels,
  y: gpuCounts,
  type: 'scatter',
  mode: 'lines+markers+text',
  name: '#GPUs',
  yaxis: 'y2',
  line: {
    color: 'red',
    width: 2
  },
  marker: {
    color: 'red',
    size: 6
  },
  text: gpuCounts.map(String),
  textposition: 'top center',
  textfont: {
    color: 'red',
    size: 12
  }
};

// Layout with double Y axes
const barLayout = {
  title: '',
  barmode: 'group',
  xaxis: {
    title: 'GPU Type',
    tickangle: -45
  },
  yaxis: {
    title: 'Performance per TCO (ns/day/€ * atoms)',
    rangemode: 'tozero',
    showgrid: true
  },
  yaxis2: {
    title: '#GPUs',
    overlaying: 'y',
    side: 'right',
    rangemode: 'tozero',
    showgrid: false,
    tickformat: ',d',
    color: 'red'
  },
  legend: {
    orientation: 'h',
    y: -0.2
  },
  height: 500,
  margin: { t: 60, b: 100, l: 80, r: 80 }
};

Plotly.newPlot('gpu-chart', [perfTrace, gpuTrace], barLayout, { displayModeBar: true });

// Add a button to download the GPU chart as PNG or SVG with high resolution
const gpuDownloadDiv = document.createElement('div');
gpuDownloadDiv.classList.add('download-btn-container');
gpuDownloadDiv.innerHTML = `<button id="gpu-download-btn">Download Performance per TCO Chart (High Resolution)</button>`;
document.getElementById('gpu-chart').parentElement.insertBefore(gpuDownloadDiv, document.getElementById('gpu-chart'));

// Add event listener for GPU chart download
document.getElementById('gpu-download-btn').addEventListener('click', () => {
  Plotly.toImage('gpu-chart', {
    format: 'png',   // or 'svg'
    height: 800,
    width: 1200,
    scale: 2
  }).then(function (url) {
    const link = document.createElement('a');
    link.href = url;
    link.download = 'gpu_chart_high_res.png';
    link.click();
  });
});

const chartContainer = document.getElementById('gpu-chart').parentElement;
if (!document.getElementById('chart-title-perf-tco')) {
  const chartTitleDiv = document.createElement('div');
  chartTitleDiv.id = 'chart-title-perf-tco';
  chartTitleDiv.classList.add('chart-title');
  chartTitleDiv.innerHTML = 'Performance per TCO and GPU Count by GPU Type';
  chartContainer.insertBefore(chartTitleDiv, document.getElementById('gpu-chart'));
}


/// ---------- Plotly Stacked TCO Chart ----------

// Prepare the data for the TCO Breakdown
const tcoLabels = nonzeroResults.map(r => r.name);

// Define component labels
const capLabels = ['GPU cost', 'Node Server cost', 'Node Infrastructure cost', 'Node Facility cost', 'Baseline cost'];
const opLabels = ['Electricity and Cooling cost', 'Node Maintenance cost', 'Baseline cost'];

// Build data arrays for each component type
const capBreakdown = capLabels.map((_, idx) =>
  nonzeroResults.map(r => {
    // Ensure capital components exist and handle missing data
    return r.capital_components && r.capital_components[idx] !== undefined ? r.capital_components[idx] : 0;
  })
);

const opBreakdown = opLabels.map((_, idx) =>
  nonzeroResults.map(r => {
    // Ensure operational components exist and handle missing data
    return r.operational_components && r.operational_components[idx] !== undefined ? r.operational_components[idx] : 0;
  })
);

// Colors matching your Chart.js style
const plotlyColors = [
  'rgba(102,204,102,0.7)',   // GPU Cost
  'rgba(255,77,77,0.7)',     // Server Cost
  'rgba(102,255,255,0.7)',   // Infra Cost
  'rgba(255,128,179,0.7)',   // Facility Cost
  'rgba(255,204,128,0.7)',   // Baseline Capital Cost
  'rgba(128,77,255,0.7)',    // Energy and Cooling Cost
  'rgba(204,102,179,0.7)',   // Maintenance Cost
//  'rgba(179,128,255,0.7)',   
  'rgba(102,153,255,0.7)'    // Baseline Op Cost
];

// Calculate total costs for each GPU type
const totalCosts = nonzeroResults.map(r => {
  const capitalTotal = r.capital_components ? r.capital_components.reduce((sum, val) => sum + val, 0) : 0;
  const operationalTotal = r.operational_components ? r.operational_components.reduce((sum, val) => sum + val, 0) : 0;
  return capitalTotal + operationalTotal;
});

// Add percentage text for each bar (capital and operational costs)
const capTraces = capLabels.map((label, i) => ({
  x: tcoLabels,
  y: capBreakdown[i],
  name: `[Capital] ${label}`,
  type: 'bar',
  marker: { color: plotlyColors[i] },
  text: capBreakdown[i].map((value, idx) => {
    const percentage = ((value / totalCosts[idx]) * 100).toFixed(2);
    return percentage > 1 ? `${percentage}%` : '';  // Only show text for percentages above 1%
  }),
  textposition: 'inside',
  texttemplate: '%{text}',  // Show the text as percentage
}));

const opTraces = opLabels.map((label, i) => ({
  x: tcoLabels,
  y: opBreakdown[i],
  name: `[Operational] ${label}`,
  type: 'bar',
  marker: { color: plotlyColors[i + capLabels.length] },
  text: opBreakdown[i].map((value, idx) => {
    const percentage = ((value / totalCosts[idx]) * 100).toFixed(2);
    return percentage > 1 ? `${percentage}%` : '';  // Only show text for percentages above 1%
  }),
  textposition: 'inside',
  texttemplate: '%{text}',  // Show the text as percentage
}));

const tcoLayout = {
  title: '',
  barmode: 'stack',
  xaxis: {
    title: 'GPU Type',
    automargin: true
  },
  yaxis: {
    title: 'Total Cost (€)',
    automargin: true
  },
  height: 600,
  margin: { t: 60, b: 80, l: 80, r: 200 }, // Extra right margin for vertical legend
legend: {
  orientation: 'h',   // Horizontal for bottom placement
  x: 0.5,
  y: -0.2,            // Negative y for bottom placement
  xanchor: 'center',
  yanchor: 'top'      // Anchor the top of the legend box to the y position
},
  config: {
    toImageButtonOptions: {
      format: 'png',   // You can set the format (png, jpeg, svg, etc.)
      height: 4000,    // Increase height for higher resolution
      width: 6000,     // Increase width for higher resolution
      scale: 5         // Higher scale factor for better resolution
    }
  }
};

// Render the Plotly chart
Plotly.newPlot('stacked-tco-chart', [...capTraces, ...opTraces], tcoLayout, { displayModeBar: true });

// Add the chart title if it doesn't exist already
if (!document.getElementById('chart-title')) {
  const chartTitleDiv = document.createElement('div');
  chartTitleDiv.id = 'chart-title-tco-breakdown';  // Give it an ID to avoid duplication
  chartTitleDiv.classList.add('chart-title');
  chartTitleDiv.innerHTML = 'TCO Breakdown (Capital vs Operational costs)';
  document.getElementById('stacked-tco-chart').parentElement.insertBefore(chartTitleDiv, document.getElementById('stacked-tco-chart'));
}

// Add a button to download the plot as PNG or SVG with high resolution
const downloadButtonDiv = document.createElement('div');
downloadButtonDiv.classList.add('download-btn-container');
downloadButtonDiv.innerHTML = `<button id="download-btn">Download TCO Breakdown Stack Chart (High Resolution)</button>`;
document.getElementById('stacked-tco-chart').parentElement.insertBefore(downloadButtonDiv, document.getElementById('stacked-tco-chart'));

// Add event listener for the button
document.getElementById('download-btn').addEventListener('click', () => {
  Plotly.toImage('stacked-tco-chart', {
    format: 'png',  // You can change this to 'svg' or 'jpeg' if needed
    height: 800,    // Set height for high resolution
    width: 1200,    // Set width for high resolution
    scale: 2        // Increase scale for higher resolution
  }).then(function (url) {
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = 'tco_breakdown_high_res.png';  // Filename for the downloaded PNG
      link.click();
    } else {
      console.error("Failed to generate image");
    }
  }).catch(err => {
    console.error("Error during image generation:", err);
  });
});

/// ---------- Plotly Pi TCO Chart ----------
const pieTraces = nonzeroResults.map((gpu, index) => {
  const capital = gpu.capital_components.reduce((sum, val) => sum + val, 0);
  const operational = gpu.operational_components.reduce((sum, val) => sum + val, 0);

  return {
    type: 'pie',
    values: [capital, operational],
    labels: ['Capital Costs', 'Operational Costs'],
    domain: {
      row: Math.floor(index / 3),
      column: index % 3
    },
    name: gpu.name,
    title: { text: gpu.name, font: { size: 12 } },
    textinfo: 'percent',  // You can also try `'none'` to remove all text from slices
    hoverinfo: 'label+percent+value',
    hole: 0.4,
    showlegend: index === 0,
    legendgroup: 'costs',
    marker: {
      colors: ['rgba(100,149,237,0.7)', 'rgba(255,160,122,0.7)']
    }
  };
});

const rows = Math.ceil(nonzeroResults.length / 3);

const pieLayout = {
  grid: { rows: rows, columns: 3 }, //If the number of GPUs is large, consider increasing the number of columns 
  height: rows * 180,  // Reduced height per row
  showlegend: true,
legend: {
  orientation: 'h',   // Horizontal for bottom placement
  x: 0.5,
  y: -0.2,            // Negative y for bottom placement
  xanchor: 'center',
  yanchor: 'top'      // Anchor the top of the legend box to the y position
},
  margin: { t: 40, b: 60 }
};

Plotly.newPlot('pie-tco-chart', pieTraces, pieLayout);


if (!document.getElementById('download-pie-btn')) {
  const pieDownloadBtn = document.createElement('div');
  pieDownloadBtn.classList.add('download-btn-container'); // Optional styling hook
  pieDownloadBtn.innerHTML = `
    <button id="download-pie-btn">Download TCO Breakdown Pie Chart (High Resolution)</button>
  `;
  document.getElementById('pie-tco-chart').parentElement.insertBefore(
    pieDownloadBtn,
    document.getElementById('pie-tco-chart')
  );

  document.getElementById('download-pie-btn').addEventListener('click', () => {
    Plotly.toImage('pie-tco-chart', {
      format: 'png',
      height: 600,  // smaller height for better fit
      width: 900,   // wider for 3-column layout
      scale: 2
    }).then(url => {
      const link = document.createElement('a');
      link.href = url;
      link.download = 'tco_pie_chart.png';
      link.click();
    }).catch(err => {
      console.error("Error generating pie chart image:", err);
    });
  });
}





// ---------- Parameter Sensitivities Analysis ----------
const elasticityLabels = [
  'GPU (€)', 'Node Server (€)', 'Node Infrastructure (€)', 'Node Facility (€)', 'Software (€)',
  'Electricity (€/kWh)', 'Heat Reuse Revenue (€/kWh)', 'PUE', 'Node Maintenance (€/year)', 'System Usage (hrs/year)', 
  'System Lifetime (years)',  'Node Baseline Power w/o GPUs (W)',  
  'Depreciation cost (€/year)', 'Software Subscription (€/year)', 'Utilization Inefficiency (€/year)'
];

const elasticities = window.results.map((r, i) => {
  const originalGPUIndex = r.originalGPUIndex;

  if (originalGPUIndex === undefined || originalGPUIndex < 0 || originalGPUIndex >= GPU_data.length) {
    console.error(`Invalid originalGPUIndex: ${originalGPUIndex} for result ${r.name}`);
    return null;  // Skip this result
  }

  const gpu = GPU_data[originalGPUIndex];

  const n_gpu = r.n_gpu;
  const n_nodes = n_gpu / gpu.per_node;
  const W_gpu = gpu.power[workload][benchmarkId];

  const W_gpu_total = (W_gpu * system_usage * lifetime * n_gpu) / 1000;
  const W_node_total = (W_node_baseline * system_usage * lifetime * n_nodes) / 1000;

  const vals = [
    n_gpu, // GPU cost
    n_nodes, // Server cost
    n_nodes, // Infra cost
    n_nodes, // Facility cost
    1, // Software cost
     PUE * (W_node_total + W_gpu_total), // Electricity 
    - PUE * (W_node_total + W_gpu_total), // Heat reuse 
    (C_electricity - ( F_heatreuse * C_heatreuseperkWh)) * (W_node_total + W_gpu_total), // PUE
    n_nodes * lifetime, // Maintenance
    (C_electricity - ( F_heatreuse * C_heatreuseperkWh)) * PUE * ((W_node_baseline * lifetime * n_nodes) + (W_gpu * lifetime * n_gpu)) / 1000, // System Usage (hrs/year)
    ((C_electricity - ( F_heatreuse * C_heatreuseperkWh)) * PUE * ((W_node_baseline * system_usage * n_nodes) + (W_gpu * system_usage * n_gpu)) / 1000) + (C_maintenance  * n_nodes) + C_depreciation + C_subscription + C_uefficiency, // System Lifetime (years)
    ((C_electricity - ( F_heatreuse * C_heatreuseperkWh)) * PUE * system_usage * lifetime * n_nodes) / 1000, // Node Baseline Power w/o GPUs (W)
    lifetime, // Depreciation
    lifetime, // Subscription
    lifetime // Uefficiency
  ];

  const baseValues = [
    gpu.cost,
    C_node_server,
    C_node_infra,
    C_node_facility,  
    C_software,
    C_electricity,
    C_heatreuseperkWh, 
    PUE,
    C_maintenance,
    system_usage, 
    lifetime, 
    W_node_baseline,
    C_depreciation,
    C_subscription,
    C_uefficiency
  ];

  return vals ? vals.map((v, idx) => (v * baseValues[idx]) / r.total_cost) : null;
}).filter(val => val !== null);


// ---------- Plotly Tornado Chart ----------
const tornadoContainer = document.getElementById("gpuTornadoPlots");
tornadoContainer.innerHTML = ""; // Clear previous charts

// Add a main title above the charts
const mainTitle = document.createElement("h2");
mainTitle.textContent = "Parameters Sensitivity Analysis";  // Main title for all charts
mainTitle.className = "main-chart-title";  // Add a class for styling
tornadoContainer.appendChild(mainTitle);  // Append the title before all charts

elasticities.forEach((gpuElasticity, i) => {
  const gpuName = window.results[i].name;

  // Sort by absolute value of elasticity
  const sorted = gpuElasticity
    .map((val, idx) => ({ val, idx }))
    .sort((a, b) => Math.abs(b.val) - Math.abs(a.val));

  const topN = 3;
  const sortedVals = sorted.map(x => x.val);
  const sortedLabels = sorted.map(x => elasticityLabels[x.idx]);

  const colors = sorted.map((x, idx) =>
    idx < topN ? 'rgba(255,77,77,0.9)' : (x.val >= 0 ? 'rgba(102,204,102,0.7)' : 'rgba(51,102,255,0.7)')
  );

  const chartId = `tornado-${gpuName.replace(/\s+/g, '-')}`;
  const chartDiv = document.createElement("div");
  chartDiv.id = chartId;
  chartDiv.className = "tornado-chart";
  tornadoContainer.appendChild(chartDiv);

  const trace = {
    x: sortedVals,
    y: sortedLabels,
    type: "bar",
    orientation: "h",
    marker: { color: colors }
  };

  const layout = {
    xaxis: {
          title: {
      text: "Norm. sensitivity",
      standoff: 20  // Adjust the distance between the x-axis and its title
    },
      zeroline: true,
      zerolinewidth: 1,
    tickangle: 0,  // Ensure x-axis labels are not rotated
      zerolinecolor: "#000"
    },
    yaxis: {
      automargin: true,
    title: "Parameter",
    tickmode: 'array',  // Ensure all labels are shown
    tickvals: sortedLabels // Explicitly provide all label values if needed
    },
    margin: { l: 160, r: 20, t: 30, b: 30 },
    height: 250,
    width: 400,
    showlegend: false
  };

  Plotly.newPlot(chartId, [trace], layout, { displayModeBar: true });

  // Optional: You can add the GPU name as a subtitle under each chart if desired
  const titleDiv = document.createElement("div");
  titleDiv.className = "chart-title";
  titleDiv.textContent = gpuName;  // Use the GPU name as the title for each chart
  tornadoContainer.appendChild(titleDiv);
});



// ---------- Plotly Heat Map Chart ----------
const whiteToRedColorscale = [
  [0, 'rgb(255,255,255)'],  // White
  [1, 'rgb(255,0,0)']       // Red
];

const allZ = elasticities.flat(); // Flatten for color scale limits
const zMax = Math.max(...allZ);

const heatmapData = [{
  z: elasticities[0].map((_, i) => elasticities.map(row => row[i])), 
  x: window.results.map(r => r.name),
  y: elasticityLabels,
  type: 'heatmap',
  colorscale: whiteToRedColorscale,
  zmin: 0,
  zmax: zMax,
  colorbar: {
    title: 'Normalized Sensitivity',
    tickformat: '.2f'
  }
}];

Plotly.newPlot('sensitivityHeatmap', heatmapData, {
  title: '',
  xaxis: { title: 'GPU type' },
  yaxis: { title: {
      text: "Parameter",  // Ensure the title is explicitly set
      standoff: 20  // Adds some space between the axis and the title
    }, automargin: true },
  margin: { t: 60, l: 150 }
});

// Add a button to download the Heatmap chart as PNG or SVG with high resolution
const heatmapDownloadDiv = document.createElement('div');
heatmapDownloadDiv.classList.add('download-btn-container');
heatmapDownloadDiv.innerHTML = `<button id="heatmap-download-btn">Download Heatmap (High Resolution)</button>`;
document.getElementById('sensitivityHeatmap').parentElement.insertBefore(heatmapDownloadDiv, document.getElementById('sensitivityHeatmap'));

// Add event listener for Heatmap chart download
document.getElementById('heatmap-download-btn').addEventListener('click', () => {
  Plotly.toImage('sensitivityHeatmap', {
    format: 'png',   // You can change to 'svg' for vector output
    height: 800,
    width: 1200,
    scale: 2
  }).then(function (url) {
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sensitivity_heatmap_high_res.png';
    link.click();
  });
});


const chartTitleDiv = document.createElement('div');
chartTitleDiv.classList.add('chart-title');
chartTitleDiv.innerHTML = 'Heatmap: Sensitivity of Parameters across GPUs';
document.getElementById('sensitivityHeatmap').parentElement.insertBefore(chartTitleDiv, document.getElementById('sensitivityHeatmap'));


renderElasticityTableWithColors();

// ---------- Print sensitivities in HTML table ----------
function getHeatmapColor(value, maxAbs) {
  const intensity = Math.min(Math.abs(value) / maxAbs, 1); // normalize [0,1]
  if (value >= 0) {
    // Green positive: from white to green
    return `rgba(102, 204, 102, ${intensity})`;
  } else {
    // Red negative: from white to red
    return `rgba(255, 77, 77, ${intensity})`;
  }
}

function renderElasticityTableWithColors() {
  const capitalLabels = elasticityLabels.slice(0, 5);
  const operationalLabels = elasticityLabels.slice(5);

  // Find maximum absolute elasticity for scaling color intensity
  const maxAbsElasticity = Math.max(...elasticities.flat().map(Math.abs));

  let tableHTML = "<h3>Normalized Sensitivities for Capital Cost Parameters</h3>";
  tableHTML += `<table border="1" cellpadding="6"><thead><tr><th>GPU</th>`;
  capitalLabels.forEach(label => {
    tableHTML += `<th>${label}</th>`;
  });
  tableHTML += "</tr></thead><tbody>";

  elasticities.forEach((gpuElasticity, i) => {
    tableHTML += `<tr><td>${window.results[i].name}</td>`;
    for (let j = 0; j < 5; j++) {
      const val = gpuElasticity[j];
      const bgColor = getHeatmapColor(val, maxAbsElasticity);
      tableHTML += `<td style="background-color:${bgColor}">${val.toFixed(2)}</td>`;
    }
    tableHTML += "</tr>";
  });

  tableHTML += "</tbody></table>";

  tableHTML += `<hr><h3>Normalized Sensitivities for Operational Cost Parameters</h3>`;
  tableHTML += `<table border="1" cellpadding="6"><thead><tr><th>GPU</th>`;
  operationalLabels.forEach(label => {
    tableHTML += `<th>${label}</th>`;
  });
  tableHTML += "</tr></thead><tbody>";

  elasticities.forEach((gpuElasticity, i) => {
    tableHTML += `<tr><td>${window.results[i].name}</td>`;
    for (let j = 5; j < elasticityLabels.length; j++) {
      const val = gpuElasticity[j];
      const bgColor = getHeatmapColor(val, maxAbsElasticity);
      tableHTML += `<td style="background-color:${bgColor}">${val.toFixed(2)}</td>`;
    }
    tableHTML += "</tr>";
  });

  tableHTML += "</tbody></table>";

  document.getElementById("elasticityTableContainer").innerHTML = tableHTML;
}

document.getElementById("download-elasticity-csv").addEventListener("click", () => {
  const headers = ["GPU", ...elasticityLabels];
  const rows = elasticities.map((row, i) => [
    window.results[i].name,
    ...row.map(val => val.toFixed(2))
  ]);
  const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
  downloadCSV(csvContent, "cost_elasticities.csv");
});

// downloadCSV
function downloadCSV(data, filename) {
  if (!data) {
    console.error("No data provided for CSV download.");
    return;
  }

  if (!filename) {
    console.error("No filename provided.");
    return;
  }
  
    try {
    const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Optionally revoke the URL after download
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error while downloading the CSV:", error);
  }
}

//return nonzeroResults;

}

// Heatmaps: Benchmark × GPU Performance and Power
function renderPerfPowerHeatmaps() {
  const workload = document.getElementById("workload").value;
  const gpuNames = GPU_data.map(g => g.name);
  const benchmarkIds = Array.from(new Set(
    GPU_data.flatMap(gpu => Object.keys(gpu.perf[workload] || {}))
  )).map(Number).sort((a, b) => a - b);

  const perfData = [];
  const powerData = [];

  for (const id of benchmarkIds) {
    const perfRow = [];
    const powerRow = [];

    for (const gpu of GPU_data) {
      const perf = gpu.perf[workload][id] || 0;
      const power = gpu.power[workload][id] || 0;
      perfRow.push(perf);
      powerRow.push(power);
    }

    perfData.push(perfRow);
    powerData.push(powerRow);
  }

  const container = document.getElementById("gpuPerfPowerHeatmap");
  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 20px;">
      <div id="perf-heatmap" style="flex: 1 1 48%; min-width: 300px;"></div>
      <div id="power-heatmap" style="flex: 1 1 48%; min-width: 300px;"></div>
    </div>
  `;

  Plotly.newPlot("perf-heatmap", [{
    z: perfData,
    x: gpuNames,
    y: benchmarkIds,
    type: "heatmap",
    colorscale: "Viridis",
    colorbar: { title: "ns/day * atom" }
  }], {
    title: `${workload} Performance (ns/day)`,
    xaxis: { title: "GPU Type" },
    yaxis: { title: "Benchmark ID" }
  });

  Plotly.newPlot("power-heatmap", [{
    z: powerData,
    x: gpuNames,
    y: benchmarkIds,
    type: "heatmap",
    colorscale: "YlOrRd",
    colorbar: { title: "Watts" }
  }], {
    title: `${workload} Power Consumption (W)`,
    xaxis: { title: "GPU Type" },
    yaxis: { title: "Benchmark ID" }
  });
}


function showFormula() {
  alert(`
    Performance Per Total Cost of Ownership (TCO) calculation:

    Performance / TCO = Performance / (C_capital + C_operational)

    with:

    C_capital = n_gpu * (
                    C_gpu
                 + C_node_server / GPUs_per_node
                 + C_node_infrastructure / GPUs_per_node
                 + C_node_facility / GPUs_per_node )
                 + C_software

    C_operational = C_operational_perYear * lifetime

    where:

    C_operational_perYear = n_gpu * (
                  (C_electricityperkWh - ( Factor_heatreuse * C_heatreuseperkWh)) * PUE * (W_node_baseline * systemusage / GPUs_per_node + W_gpu * systemusage) / 1000
                 + C_node_maintenance / GPUs_per_node )
              + C_depreciation
              + C_subscription
              + C_uefficiency
    `);
}

// Function to display the password prompt when the "Show Formula" button is clicked
function promptPassword() {
  document.getElementById('password-prompt').style.display = 'block';
}

function validatePassword() {
  const enteredPassword = document.getElementById('password').value;
  const correctPassword = 'TCO25'; // Replace with your password

  if (enteredPassword === correctPassword) {
    document.getElementById('password-prompt').style.display = 'none';
    document.getElementById('error-message').style.display = 'none';
    showFormula(); // 
  } else {
    document.getElementById('error-message').style.display = 'block';
  }
}

// Dark mode toggle logic
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("themeToggle");
  const icon = document.getElementById("themeIcon");

  // Load saved preference
  const isDark = localStorage.getItem("darkMode") === "true";
  document.body.classList.toggle("dark", isDark);
  toggle.checked = isDark;
  icon.textContent = isDark ? "🌙" : "🌞";

  toggle.addEventListener("change", () => {
    const enabled = toggle.checked;
    document.body.classList.toggle("dark", enabled);
    icon.textContent = enabled ? "🌙" : "🌞";
    localStorage.setItem("darkMode", enabled);
  });
});

// This function updates the tip based on slider values
function updateAITip(event) {
  const id = event?.target?.id || "default";
  let tip = "💡 Adjusting values can help optimize your Performance per TCO!";

  switch (id) {
    case "total_budget":
      tip = "💡 With a high budget, you can focus on premium components for better performance. Higher budget gives flexibility, but consider diminishing returns!";
      break;
    case "C_node_server":
      tip = "💡 Server cost significantly impacts capital expenses. Choose wisely. Investing in higher node server costs may result in better long-term performance.";
      break;
    case "C_node_infra":
      tip = "💡 High infrastructure costs might impact the overall TCO, consider more efficient setups with power and cooling consolidation.";
      break;
    case "C_node_facility":
      tip = "💡 Optimize facility overhead if co-locating or using containerized systems. Facility costs may be low if you're co-locating equipment.";
      break;
    case "C_software":
      tip = "💡 High software costs? Consider academic/open-source solutions or alternative software packages.";
      break;
    case "C_electricity":
      tip = "💡 Electricity is a major operating cost, consider more energy-efficient solutions.. Efficient hardware = long-term savings.";
      break;
    case "C_PUE":
      tip = "💡 Lower PUE improves energy efficiency. Lower = better. Target ≤1.3 if possible.";
      break;        
    case "C_maintenance":
      tip = "💡 High maintenance costs? You may want to review your hardware warranty and support contracts. Maintenance costs grow over time. Consider long-term warranties to reduce Annual maintenance adds up.";
      break; 
    case "system_usage":
      tip = "💡 Higher system usage increases amortization but also operational cost. More hours per year = better GPU utilization. With lower system usage, you might optimize costs by lowering the power consumption.";
      break;    
    case "lifetime":
      tip = "💡 Longer lifetime reduces yearly cost but may increase risk of obsolescence.";
      break;      
    case "W_node_baseline":
      tip = "💡 Baseline power matters. Lower baseline power = less wasted energy during idle workloads. Consider optimizing the power usage of nodes for better operational efficiency.";
      break;  
    case "C_depreciation":
      tip = "💡 Depreciation impacts financial reporting. Keep it aligned with hardware lifecycle. High depreciation values may reduce your overall return on investment. Consider reviewing your asset management.";
      break;
    case "C_subscription":
      tip = "💡 Subscriptions add recurring costs. Compare long-term licensing vs. perpetual. Look for alternative pricing models.";
      break;
    case "C_uefficiency":
      tip = "💡 Utilization inefficiency means idle GPUs. Underutilized GPUs are costly, aim for workload balancing. Monitor workloads and consider optimizing system usage.";
      break;
    case "C_heatreuseperkWh":
    case "Factor_heatreuse":
      tip = "💡 Heat reuse offsets electricity costs. A higher heat reuse factor will significantly reduce effective energy costs. Optimize your heat recovery system!";
      break;
    case "benchmarkId":
      tip = "💡 Benchmark choice impacts performance and power estimates. Choose the closest match to your workload.";
      break;
    case "workload":
      tip = "💡 Choose between GROMACS or AMBER based on your scientific simulation needs.";
      break;
    default:
      tip = "💡 Adjusting values can help optimize your Performance per TCO!";
  }

  document.getElementById("ai-tip-text").innerText = tip;
}


document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('input[type="range"], input[type="number"], select').forEach(input => {
    input.addEventListener("input", updateAITip);
  });
});

function generateBlogPost() {
  const workload = document.getElementById('workload').value;
  const benchmarkId = document.getElementById('benchmarkId').value;
  const totalBudget = document.getElementById('total_budget').value;

  const bestGpu = window.bestResult?.name || "N/A";
  const bestPerfTCO = window.bestResult?.perf_per_tco?.toFixed(2) || "N/A";
  const tipText = document.getElementById("ai-tip-text").innerText || "No tips generated.";

  if (bestGpu === "N/A") {
    alert("Please run a calculation first before generating the blog post.");
    return;
  }

  const blog = `## Optimizing Performance Per TCO for GPU Systems

In this analysis, we used the **Performance per TCO Calculator** to evaluate GPU-based compute nodes for ${workload} workloads using Benchmark ID **${benchmarkId}**.

### 🛠️ System Configuration
- **Total Budget**: €${parseInt(totalBudget).toLocaleString()}
- **Benchmark**: ${workload} (ID ${benchmarkId})
- **Capital & Operational Costs**: Customized using sliders.

### 📈 Results
The best GPU configuration was:
- **GPU**: ${bestGpu}
- **Performance per TCO**: ${bestPerfTCO} ns/day/€ * atom

### 💡 Optimization Insight
${tipText}

---

This result can help inform purchasing and planning decisions for upcoming system acquisitions. You can explore further by adjusting budget, node costs, or energy parameters at [perfpertco.netlify.app](https://perfpertco.netlify.app).
`;

  document.getElementById("blogOutput").value = blog;
}

// Import and export CSV/JSON files
function handleGPUUpload() {
  const file = document.getElementById("gpuConfigUpload").files[0];
  const format = document.getElementById("gpuUploadFormat").value;
  const status = document.getElementById("uploadStatus");

  if (!file) {
    status.innerText = "No file selected.";
    status.style.color = "red";
    return;
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      let data;
      if (format === "json") {
        data = JSON.parse(e.target.result);
      } else {
        data = parseCSVToGPUData(e.target.result);
      }

      validateAndAppendJSON(data, status);
    } catch (err) {
      status.innerText = "❌ Error: " + err;
      status.style.color = "red";
    }
  };

  reader.readAsText(file);
}

function validateAndAppendJSON(data, status) {
  if (!Array.isArray(data)) throw "Expected an array of GPU objects.";

  const requiredFields = ["name", "cost", "perf", "power", "per_node"];
  for (const [i, gpu] of data.entries()) {
    for (const field of requiredFields) {
      if (!(field in gpu)) throw `GPU ${i + 1} is missing field "${field}".`;
    }
    if (typeof gpu.perf !== "object" || typeof gpu.power !== "object") {
      throw `GPU ${i + 1} has invalid perf/power format. Expected nested workload structure.`;
    }
  }

  GPU_data = data;

  status.innerText = `✅ Loaded ${data.length} GPU(s). You can now calculate.`;
  status.style.color = "green";
}


function parseCSVToGPUData(csvText) {
  const rows = csvText.trim().split("\n");
  const header = rows[0].split(",");
  const data = [];
  const gpuMap = {};

  for (let i = 1; i < rows.length; i++) {
    const cols = rows[i].split(",");
    const [name, cost, per_node, workload, benchId, perf, power] = cols;

    if (!gpuMap[name]) {
      gpuMap[name] = {
        name,
        cost: parseFloat(cost),
        per_node: parseInt(per_node),
        perf: {},
        power: {}
      };
    }

    const gpu = gpuMap[name];

    if (!gpu.perf[workload]) gpu.perf[workload] = {};
    if (!gpu.power[workload]) gpu.power[workload] = {};

    gpu.perf[workload][benchId] = parseFloat(perf);
    gpu.power[workload][benchId] = parseFloat(power);
  }

  // Convert map to array
  return Object.values(gpuMap);
}


function exportGPUDataJSON() {
  const blob = new Blob([JSON.stringify(GPU_data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "gpu_config_export.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

function exportGPUDataCSV() {
  let csv = "name,cost,per_node,workload,benchmark_id,performance,power\n";
  GPU_data.forEach(gpu => {
    const workloads = Object.keys(gpu.perf || {});
    workloads.forEach(w => {
      const perfEntries = gpu.perf[w];
      const powerEntries = gpu.power[w];
      for (const id in perfEntries) {
        const perf = perfEntries[id];
        const power = powerEntries?.[id] || "";
        csv += `${gpu.name},${gpu.cost},${gpu.per_node},${w},${id},${perf},${power}\n`;
      }
    });
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "gpu_config_export.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

  function handleMainGPUUpload() {
    const file = document.getElementById("gpuConfigUploadMain").files[0];
    const format = document.getElementById("gpuUploadFormatMain").value;
    const status = document.getElementById("uploadStatusMain");

    if (!file) {
      status.innerText = "No file selected.";
      status.style.color = "red";
      return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
      try {
        let data = format === "json"
          ? JSON.parse(e.target.result)
          : parseCSVToGPUData(e.target.result);

        validateAndAppendJSON(data, status);
      } catch (err) {
        status.innerText = "❌ Error: " + err;
        status.style.color = "red";
      }
    };

    reader.readAsText(file);

  }

// generatePDFReport
async function generatePDFReport() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = 15;
  const lineHeight = 7;
  const wrap = (text, max) => doc.splitTextToSize(text, max || 180);

  const now = new Date().toLocaleString();
  const workload = document.getElementById("workload").value;
  const benchmarkId = document.getElementById("benchmarkId").value;
  const tip = document.getElementById("ai-tip-text").innerText;

  const getVal = id => document.getElementById(id)?.value || "–";

  const sliders = [
    ["Total Budget (€)", "total_budget"],
    ["Node Server", "C_node_server"],
    ["Node Infra", "C_node_infra"],
    ["Facility", "C_node_facility"],
    ["Software", "C_software"],
    ["Electricity (€/kWh)", "C_electricity"],
    ["PUE", "C_PUE"],
    ["System Usage (hrs/year)", "system_usage"],
    ["Lifetime (yrs)", "lifetime"],
    ["Baseline Power (W)", "W_node_baseline"],
    ["Depreciation", "C_depreciation"],
    ["Subscription", "C_subscription"],
    ["Inefficiency", "C_uefficiency"],
    ["Heat Revenue/kWh", "C_heatreuseperkWh"],
    ["Heat Reuse Factor", "Factor_heatreuse"],
    ["Maintenance", "C_maintenance"]
  ];

  const addHeader = (title) => {
    doc.setFontSize(14);
    doc.text(title, 15, y);
    y += lineHeight;
    doc.setFontSize(11);
  };

  const checkPage = () => {
    if (y > 275) {
      doc.addPage();
      y = 15;
    }
  };

  // --- Title
  doc.setFontSize(16);
  doc.text("Performance per TCO Report", 15, y);
  y += lineHeight;
  doc.setFontSize(10);
  doc.text(`Generated: ${now}`, 15, y);
  y += lineHeight;

  // --- Section 1: Inputs
  addHeader("1. Input Parameters");
  sliders.forEach(([label, id]) => {
    checkPage();
    doc.text(`${label}: ${getVal(id)}`, 15, y);
    y += lineHeight;
  });

  // --- Section 2: Summary
  y += 5; checkPage();
  addHeader("2. Calculation Summary");

  const best = window.bestResult;
  if (best) {
    doc.text(`Best GPU: ${best.name}`, 15, y); y += lineHeight;
    doc.text(`Performance per TCO: ${best.perf_per_tco.toExponential(3)} ns/day/€`, 15, y); y += lineHeight;
  } else {
    doc.text("No calculation result found. Please calculate before exporting.", 15, y);
    y += lineHeight;
  }

  // --- Section 3: AI Tip
  y += 5; checkPage();
  addHeader("3. Smart Strategy Tip");
  const tipLines = wrap(tip);
  tipLines.forEach(line => { doc.text(line, 15, y); y += lineHeight; });

  // --- Footer
  y += 10;
  doc.setFontSize(8);
  doc.text("Generated using PerfPerTCO Calculator – © 2025 Ayesha Afzal <mailto:ayesha.afzal@fau.de>, NHR@HPC, FAU Erlangen-Nürnberg", 15, 285);

  // --- Save
  doc.save(`PerfPerTCO_Report_${now.replace(/[^\d]/g, "_")}.pdf`);
}

function saveScenario(keyName) {
  const scenario = {
    sliders: {},
    selects: {},
    checkboxes: {}
  };

  // Save all sliders (input[type="range"] and input[type="number"])
  document.querySelectorAll('input[type="range"], input[type="number"]').forEach(input => {
    scenario.sliders[input.id] = parseFloat(input.value);
  });

  // Save all select dropdowns
  document.querySelectorAll('select').forEach(select => {
    scenario.selects[select.id] = select.value;
  });

  // Save all checkboxes
  document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    scenario.checkboxes[checkbox.id] = checkbox.checked;
  });

  // Save to localStorage
  localStorage.setItem(keyName, JSON.stringify(scenario));
  console.log(`✅ Scenario '${keyName}' saved successfully.`);
  alert(`✅ '${keyName}' saved!`);
}

function getGreenScale(value, min, max) {
  if (value === null || value === undefined || isNaN(value)) return 'white';
  const percent = (value - min) / (max - min || 1); // prevent divide-by-zero
  const g = Math.round(200 + percent * 55); // 200 (light) to 255 (full green)
  return `rgb(200, ${g}, 200)`; // green tint, soft RGB mix
}


async function compareScenarios() {
  console.log("Scenario 1 Data:", localStorage.getItem('scenario1'));
  console.log("Scenario 2 Data:", localStorage.getItem('scenario2'));

  const scenario1 = JSON.parse(localStorage.getItem('scenario1'));
  const scenario2 = JSON.parse(localStorage.getItem('scenario2'));

  if (!scenario1 || !scenario2) {
    alert("❗ Please save both Scenario 1 and Scenario 2 first!");
    return;
  }

  // Simulate
  const results1 = simulateCalculation(scenario1);
  const results2 = simulateCalculation(scenario2);

  console.log("Results 1: ", results1);
  console.log("Results 2: ", results2);

  if (!Array.isArray(results1) || !Array.isArray(results2)) {
    alert("❗ Calculation results are not arrays.");
    return;
  }

  if (results1.length === 0 || results2.length === 0) {
    alert("❗ No GPU results available.");
    return;
  }

const perf1 = results1.map(r => r.perf_per_tco);
const perf2 = results2.map(r => r.perf_per_tco);

const minPerf1 = Math.min(...perf1);
const maxPerf1 = Math.max(...perf1);
const minPerf2 = Math.min(...perf2);
const maxPerf2 = Math.max(...perf2);

  // 🎨 Helper to color and emoji based on % change
  function renderChangeCell(change) {
    if (change === "N/A") {
      return `<td style="text-align: center; background: lightgray;">N/A</td>`;
    }

    const absChange = Math.abs(change);
    let bgColor = "white";
    let emoji = "➖";

    if (change > 0) {
      emoji = "📈";
      if (absChange > 15) bgColor = "#c8e6c9"; // strong green
      else if (absChange > 5) bgColor = "#e8f5e9"; // soft green
    } else if (change < 0) {
      emoji = "📉";
      if (absChange > 15) bgColor = "#ffcdd2"; // strong red
      else if (absChange > 5) bgColor = "#ffebee"; // soft red
    }

    const sign = change > 0 ? "+" : "";
    return `<td style="text-align: center; background: ${bgColor};">${emoji} ${sign}${change.toFixed(2)}%</td>`;
  }

  function percentageChange(a, b) {
    if (a === 0) return "N/A";
    return (((b - a) / a) * 100);
  }

  // Start HTML: Inputs Section
  let html = `<h3 style="margin-top: 40px;">🛠 Input Comparison</h3>`;
  html += `<table style="width: 100%; border-collapse: collapse; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
    <thead>
      <tr>
        <th>Input Parameter</th>
        <th>Scenario 1</th>
        <th>Scenario 2</th>
        <th>Δ Change</th>
      </tr>
    </thead><tbody>`;

  for (const id in scenario1.sliders) {
    const val1 = scenario1.sliders[id];
    const val2 = scenario2.sliders[id];
    const diff = val2 - val1;
    const pctChange = val1 !== 0 ? (diff / val1) * 100 : "N/A";

    html += `
      <tr>
        <td>${id}</td>
        <td>${val1}</td>
        <td>${val2}</td>
        ${renderChangeCell(pctChange)}
      </tr>
    `;
  }
  html += `</tbody></table>`;

  // 📈 Outputs Section
  html += `<h3 style="margin-top: 40px;">📈 Output Comparison</h3>`;
  html += `<table style="width: 100%; border-collapse: collapse; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
    <thead>
      <tr>
        <th>Output Parameter</th>
        <th>Scenario 1</th>
        <th>Scenario 2</th>
        <th>Δ Change</th>
      </tr>
    </thead><tbody>`;

  results1.forEach((result1, index) => {
    const result2 = results2[index];

    html += `
      <tr>
        <td>Total TCO (€) for ${result1.name}</td>
        <td>${result1.total_cost.toLocaleString(undefined, { maximumFractionDigits: 1 })}</td>
        <td>${result2.total_cost.toLocaleString(undefined, { maximumFractionDigits: 1 })}</td>
        ${renderChangeCell(percentageChange(result1.total_cost, result2.total_cost))}
      </tr>
      <tr>
        <td>Number of GPUs for ${result1.name}</td>
        <td>${result1.n_gpu}</td>
        <td>${result2.n_gpu}</td>
        ${renderChangeCell(percentageChange(result1.n_gpu, result2.n_gpu))}
      </tr>
      <tr>
        <td>Performance (ns/day*atom) for all ${result1.name}</td>
        <td>${result1.performance.toLocaleString(undefined, { maximumFractionDigits: 1 })}</td>
        <td>${result2.performance.toLocaleString(undefined, { maximumFractionDigits: 1 })}</td>
        ${renderChangeCell(percentageChange(result1.performance, result2.performance))}
      </tr>
      <tr>
        <td>Total Power (W) for all ${result1.name}</td>
        <td>${result1.power.toFixed(1)}</td>
        <td>${result2.power.toFixed(1)}</td>
        ${renderChangeCell(percentageChange(result1.power, result2.power))}
      </tr>
<tr>
  <td><strong>Performance per TCO (ns/day/€ * atom) for ${result1.name}</strong></td>
  <td style="background: ${getGreenScale(result1.perf_per_tco, minPerf1, maxPerf1)};">
    <strong>${result1.perf_per_tco.toFixed(1)}</strong>
  </td>
  <td style="background: ${getGreenScale(result2.perf_per_tco, minPerf2, maxPerf2)};">
    <strong>${result2.perf_per_tco.toFixed(1)}</strong>
  </td>
  ${renderChangeCell(percentageChange(result1.perf_per_tco, result2.perf_per_tco))}
</tr>

    `;
  });

  html += `</tbody></table>`;

  // Inject final HTML
  document.getElementById('scenario-comparison').innerHTML = html;
}





function renderChangeCell(change) {
  if (change === "N/A") {
    return `<td style="text-align: center; background: lightgray;">N/A</td>`;
  }

  const absChange = Math.abs(change);
  let bgColor = "white";
  let emoji = "➖";

  if (change > 0) {
    emoji = "📈";
    if (absChange > 15) bgColor = "#c8e6c9"; // light green
    else if (absChange > 5) bgColor = "#e8f5e9"; // very light green
  } else if (change < 0) {
    emoji = "📉";
    if (absChange > 15) bgColor = "#ffcdd2"; // light red
    else if (absChange > 5) bgColor = "#ffebee"; // very light red
  }

  const sign = change > 0 ? "+" : "";
  return `<td style="text-align: center; background: ${bgColor};">${emoji} ${sign}${change.toFixed(2)}%</td>`;
}

function simulateCalculation(scenario) {
    console.log("Simulating for scenario:", scenario);

    for (const id in scenario.sliders) {
        const input = document.getElementById(id);
        if (input) input.value = scenario.sliders[id];
    }

    for (const id in scenario.selects) {
        const select = document.getElementById(id);
        if (select) select.value = scenario.selects[id];
    }

    for (const id in scenario.checkboxes) {
        const checkbox = document.getElementById(id);
        if (checkbox) checkbox.checked = scenario.checkboxes[id];
    }

    // Reset results before re-calculate
    window.results = [];

    // Call your real calculation
    calculate();

    console.log("Calculation Results:", window.results);

    return window.results; 
}



function downloadComparisonPDF() {
  const element = document.getElementById('scenario-comparison');

  if (!element) {
    alert("❗ Please compare scenarios first!");
    return;
  }

  const opt = {
    margin:       0.5,
    filename:     'scenario_comparison.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save();
}


const footer = document.createElement('div');
footer.style.marginTop = "40px";
footer.style.padding = "12px 0";
footer.style.fontSize = "13px";
footer.style.textAlign = "center";
footer.style.color = "#666";
footer.innerHTML = `&copy; 2025, Author: Ayesha Afzal &lt;<a href="mailto:ayesha.afzal@fau.de">ayesha.afzal@fau.de</a>&gt;, NHR@HPC, FAU Erlangen-Nürnberg.`;

document.body.appendChild(footer);


