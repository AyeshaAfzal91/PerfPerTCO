/*!
 * Author: Ayesha Afzal <ayesha.afzal@fau.de>
 * © 2025 NHR@HPC, FAU Erlangen-Nuremberg. All rights reserved.
 */

async function updateGPUPrices() {
    document.getElementById('loading-spinner').style.display = 'block';
    const gpuNames = ["H100", "GH200", "A100", "A40", "L4", "L40", "L40S"];
    const updatedPrices = {};

    try {
        for (const gpu of gpuNames) {
            const response = await fetch(`/.netlify/functions/fetch-price?gpu=${gpu}`);
            console.log(`---LOG--- updateGPUPrices - ${gpu} Response Status:`, response.status);
            const data = await response.json();
            console.log(`---LOG--- updateGPUPrices - ${gpu} Raw Data:`, JSON.stringify(data));
            if (data.price) {
                updatedPrices[gpu] = data.price;
            }
        }

        activeGPUData.forEach(gpu => {
            if (updatedPrices[gpu.name]) {
                gpu.cost = updatedPrices[gpu.name] * 1.19;
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
        document.getElementById('loading-spinner').style.display = 'none';
    }
}

function maybeRefreshGPUPrices() {
    document.getElementById('loading-spinner').style.display = 'inline-block';
    document.getElementById('last-updated').style.display = 'none';
    document.getElementById('refresh-container').style.display = 'block';

    updateGPUPrices().then(() => {
        document.getElementById('last-updated').style.display = 'inline-block';
        document.getElementById('last-updated').innerText = 'Last Updated: ' + new Date().toLocaleString();
    });
}

let selectedPriceSource = "static";
let oldGPUPrices = {};

async function handlePriceSourceChange() {
    const radios = document.getElementsByName('priceSource');
    for (const radio of radios) {
        if (radio.checked) {
            selectedPriceSource = radio.value;
            break;
        }
    }

    console.log("---LOG--- handlePriceSourceChange - Start. selectedPriceSource:", selectedPriceSource);

    saveOldGPUPrices();

    if (selectedPriceSource === "live") {
        await updateGPUPrices();
    }

    await updatePricesAccordingToSelection();
    compareOldAndNewPrices();
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
    console.log("---LOG--- loadStaticGPUPrices - Start.", JSON.stringify(activeGPUData.map(g => ({ name: g.name, cost: g.cost, priceSource: g.priceSource }))));
    const staticPrices = {
        H100: 25818,
        GH200: 25000,
        A100: 7264,
        A40: 4275,
        L4: 2200,
        L40: 6024,
        L40S: 6100
    };
    activeGPUData.forEach(gpu => {
        if (staticPrices[gpu.name]) {
            gpu.cost = staticPrices[gpu.name] * 1.19;
            gpu.priceSource = "Static";
        }
    });
    console.log("---LOG--- loadStaticGPUPrices - End.", JSON.stringify(activeGPUData.map(g => ({ name: g.name, cost: g.cost, priceSource: g.priceSource }))));
}

function loadCachedGPUPrices() {
    console.log("---LOG--- loadCachedGPUPrices - Start.", JSON.stringify(activeGPUData.map(g => ({ name: g.name, cost: g.cost, priceSource: g.priceSource }))));
    const cached = localStorage.getItem('cachedGPUPrices');
    if (cached) {
        const parsed = JSON.parse(cached);
        activeGPUData.forEach(gpu => {
            if (parsed[gpu.name]) {
                gpu.cost = parsed[gpu.name] * 1.19;
                gpu.priceSource = "Live";
            } else {
                gpu.priceSource = "Live";
            }
        });
        console.log("---LOG--- loadCachedGPUPrices - End (cache found):", JSON.stringify(activeGPUData.map(g => ({ name: g.name, cost: g.cost, priceSource: g.priceSource }))));
    } else {
        activeGPUData.forEach(gpu => {
            gpu.priceSource = "Live";
        });
        console.log("---LOG--- loadCachedGPUPrices - No cached prices found. Marking as 'Live'.");
    }
}

function compareOldAndNewPrices() {
    console.log("---LOG--- compareOldAndNewPrices - Start.", JSON.stringify(oldGPUPrices), JSON.stringify(activeGPUData.map(g => ({ name: g.name, cost: g.cost, priceSource: g.priceSource }))));
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
        const threshold = 0.01;

        if (priceDiff < threshold) {
            listItem.innerHTML = `➖ <strong>${gpu.name}</strong>: No change (Old: ${oldCost.toFixed(2)} € ${oldSource}, New: ${newCost.toFixed(1)} € ${newSource})`;
            listItem.style.color = 'gray';
        } else if (newCost > oldCost) {
            const percentChange = ((newCost - oldCost) / oldCost) * 100;
            listItem.innerHTML = `📈 <strong>${gpu.name}</strong>: +${percentChange.toFixed(2)}% more expensive (Old: ${oldCost.toFixed(1)} € ${oldSource}, New: ${newCost.toFixed(1)} € ${newSource})`;
            listItem.style.color = 'red';
        } else {
            const percentChange = ((oldCost - newCost) / oldCost) * 100;
            listItem.innerHTML = `📉 <strong>${gpu.name}</strong>: -${percentChange.toFixed(2)}% cheaper (Old: ${oldCost.toFixed(1)} € ${oldSource}, New: ${newCost.toFixed(1)} € ${newSource})`;
            listItem.style.color = 'green';
        }

        list.appendChild(listItem);
    });
    console.log("---LOG--- compareOldAndNewPrices - End.");
}

let chartInstance;  // Global to allow destroy and reset zoom

async function loadPriceHistory(metric = 'percentDiff') {
  try {
    const response = await fetch('/.netlify/functions/price-history');
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Error fetching price history: ${response.statusText} - ${text}`);
    }

    const data = await response.json();

    const gpuList = ['H100', 'GH200', 'A100', 'A40', 'L4', 'L40', 'L40S'];

    // Group data by GPU
    const grouped = {};
    gpuList.forEach(gpu => {
      grouped[gpu] = data
        .filter(item => item.gpu === gpu)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    });

    // Use Date objects for labels (for time scale)
    const labels = [...new Set(data.map(item => new Date(item.date)))].sort((a, b) => a - b);

    // Main datasets (one line per GPU)
    const datasets = gpuList.map((gpu, index) => ({
      label: gpu,
      data: labels.map(date => {
        const entry = grouped[gpu].find(e => new Date(e.date).getTime() === date.getTime());
        return entry ? (metric === 'percentDiff' ? entry.percentDiff : entry.livePrice) : null;
      }),
      borderColor: getColor(index),
      backgroundColor: getColor(index, 0.2),
      fill: metric === 'livePrice' ? true : false,
      tension: 0.3,
      pointRadius: 4
    }));

    // Collect all peak jumps into one dataset
const peakJumpPoints = [];

gpuList.forEach((gpu, index) => {
  const gpuData = grouped[gpu];
  if (gpuData.length < 2) return;

  let maxJump = { diff: 0, entry: null };
  for (let i = 1; i < gpuData.length; i++) {
    const prevVal = metric === 'percentDiff' ? gpuData[i-1].percentDiff : gpuData[i-1].livePrice;
    const currVal = metric === 'percentDiff' ? gpuData[i].percentDiff : gpuData[i].livePrice;
    const jump = Math.abs(currVal - prevVal);
    if (jump > maxJump.diff) {
      maxJump = { diff: jump, entry: gpuData[i] };
    }
  }
  if (!maxJump.entry) return;

  peakJumpPoints.push({
    x: new Date(maxJump.entry.date),
    y: metric === 'percentDiff' ? maxJump.entry.percentDiff : maxJump.entry.livePrice,
  });
});

if (peakJumpPoints.length > 0) {
  datasets.push({
    label: 'Peak Jump',
    data: peakJumpPoints,
    borderColor: 'black',
    backgroundColor: 'yellow',
    pointRadius: 7,
    type: 'scatter',
    showLine: false,
    fill: false,
    hoverRadius: 10,
  });
}

    // Destroy existing chart before creating new one
    if (chartInstance) {
      chartInstance.destroy();
    }

    chartInstance = new Chart(document.getElementById("priceChart"), {
      type: "line",
      data: {
        labels: labels,
        datasets: datasets
      },
      options: {
        responsive: true,
        interaction: {
          mode: 'nearest',
          intersect: false
        },
        plugins: {
          title: {
            display: true,
            text: metric === 'percentDiff' 
              ? '% Price Difference (Live vs Static) by GPU' 
              : 'Live GPU Price Over Time (€)'
          },
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              usePointStyle: true
            },
            onClick: (e, legendItem, legend) => {
              const index = legendItem.datasetIndex;
              const chart = legend.chart;
              const meta = chart.getDatasetMeta(index);
              meta.hidden = meta.hidden === null ? !chart.data.datasets[index].hidden : null;
              chart.update();
            }
          },
          tooltip: {
            callbacks: {
              label: context => {
                if (metric === 'percentDiff') {
                  return `${context.dataset.label}: ${context.parsed.y?.toFixed(2)}%`;
                } else {
                  return `${context.dataset.label}: €${context.parsed.y?.toFixed(2)}`;
                }
              }
            }
          },
          zoom: {
            pan: {
              enabled: true,
              mode: 'x',
            },
            zoom: {
              wheel: {
                enabled: true, 
				modifierKey: 'ctrl'   
              },
              pinch: {
                enabled: true
              },
              mode: 'x',
            }
          }
        },
        scales: {
          y: {
            title: {
              display: true,
              text: metric === 'percentDiff' ? "% Difference" : "Price (€)"
            },
            beginAtZero: metric === 'percentDiff'
          },
          x: {
            title: {
              display: true,
              text: "Date"
            },
            type: 'time',
            time: {
              unit: 'day',
              tooltipFormat: 'MMM dd, yyyy'
            }
          }
        }
      }
    });

  } catch (error) {
    console.error("---ERROR--- Failed to load price history:", error);
  }
}

function getColor(index, alpha = 1) {
  const colors = [
    `rgba(255, 159, 64, ${alpha})`,   // orange
    `rgba(54, 162, 235, ${alpha})`,   // blue
    `rgba(75, 192, 192, ${alpha})`,   // green
    `rgba(255, 99, 132, ${alpha})`,   // red
    `rgba(153, 102, 255, ${alpha})`,  // purple
    `rgba(100, 181, 246, ${alpha})`,  // teal
    `rgba(160, 120, 90, ${alpha})`    // brown
  ];
  return colors[index % colors.length];
}

// Export buttons functionality
function exportChartImage() {
  if (!chartInstance) return;
  const canvas = document.getElementById("priceChart");
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = "gpu-price-chart.png";
  link.click();
}

function exportChartCSV() {
  if (!chartInstance) return;
  const gpuList = chartInstance.data.datasets
    .filter(ds => ds.type !== 'scatter')  // Exclude highlight scatter datasets
    .map(ds => ds.label);

  // Collect unique dates from labels
  const labels = chartInstance.data.labels;

  const csvRows = [];
  csvRows.push(['Date', ...gpuList]);

  labels.forEach(label => {
    const row = [label.toISOString().split('T')[0]];
    gpuList.forEach(gpu => {
      const dataset = chartInstance.data.datasets.find(ds => ds.label === gpu);
      const idx = labels.indexOf(label);
      const value = dataset.data[idx];
      row.push(value !== null && value !== undefined ? value.toFixed(2) : '');
    });
    csvRows.push(row);
  });

  const csvString = csvRows.map(row => row.join(',')).join('\n');
  const blob = new Blob([csvString], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'gpu_price_history.csv';
  link.click();
}

// Make functions globally accessible
window.exportChartImage = exportChartImage;
window.exportChartCSV = exportChartCSV;
window.zoomChart = function(factor) {
  if (chartInstance) chartInstance.zoom(factor);
};
window.resetZoom = function() {
  if (chartInstance) chartInstance.resetZoom();
};

// Attach event listener for metric dropdown (if exists)
document.getElementById("priceMetric").addEventListener("change", (e) => {
  loadPriceHistory(e.target.value);
});

loadPriceHistory('livePrice');

import { presetProfiles } from './Inputs/presetProfiles.js';

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

import { activeGPUData } from './Inputs/GPUdata.js';

// --- Reference graphics frequencies (MHz) ---
const GPU_F_REF = {
  L4: 2040,
  A40: 1740,
  L40: 2490,
  L40S: 2520,
  A100: 1410,
  H100: 1980,
  GH200: 1980   
};

const GPU_TDP_REF = {
  L4: 75,
  A40: 300,
  L40: 300,
  L40S: 300,
  A100: 400,
  H100: 700,
  GH200: 900
};

function toggleGPUFreqSlider() {
  const mode = document.querySelector('input[name="gpuFreqMode"]:checked')?.value;
  const slider = document.getElementById("slider_gpu_freq");

  if (!slider) return;

  slider.style.display = (mode === "custom") ? "block" : "none";
}

function getEffectiveGPUFreq(gpu) {
  const mode = document.querySelector('input[name="gpuFreqMode"]:checked')?.value;

  if (mode !== "custom") {
    return gpu.f_ref;  // default: reference frequency
  }

  return getSliderValue("gpu_graphics_freq");
}

function toggleGPUPowerSlider() {
  const mode = document.querySelector('input[name="gpuPowerMode"]:checked')?.value;
  const slider = document.getElementById("slider_gpu_power");

  if (!slider) return;

  slider.style.display = (mode === "custom") ? "block" : "none";
}

function getEffectiveGPUPower(gpu) {
  const mode = document.querySelector('input[name="gpuPowerMode"]:checked')?.value;

  if (mode !== "custom") {
    return gpu.tdp_ref;  // default: reference TDP
  }

  return getSliderValue("gpu_power_cap");
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('input[name="gpuFreqMode"]').forEach(radio => {
        radio.addEventListener('change', toggleGPUFreqSlider);
    });

    document.querySelectorAll('input[name="gpuPowerMode"]').forEach(radio => {
        radio.addEventListener('change', toggleGPUPowerSlider);
    });
});

if (typeof GPU_data === "undefined") {
  var GPU_data = [...activeGPUData];
}

// --- Attach reference graphics frequency to each GPU ---
GPU_data.forEach(gpu => {
  gpu.f_ref = GPU_F_REF[gpu.name] || 2000; // MHz
});

GPU_data.forEach(gpu => {
  gpu.tdp_ref = GPU_TDP_REF[gpu.name] || 300;
});

import { DVFS_PARAMS } from './Inputs/DVFS_PARAMS.js';

GPU_data.forEach(gpu => {
    const dvfs = DVFS_PARAMS[gpu.name]; 
	if (dvfs) gpu.DVFS_PARAMS = dvfs;
});

function computeGpuPowerDVFS(gpu, basePower, gpuFreq, workload, benchmarkId) {
  const dvfsParamsObj = DVFS_PARAMS[gpu.name];
  if (!dvfsParamsObj) return basePower;

  const dvfsParams = dvfsParamsObj[workload]?.[benchmarkId];
  if (!dvfsParams) return basePower;

  const { f_t, b1, c1, a2, b2, c2 } = dvfsParams;
  //const f_norm = gpuFreq / gpu.f_ref;

  let phi;
  if (gpuFreq <= f_t) {
    phi = b1 * gpuFreq + c1;
  } else {
    phi = a2 * gpuFreq * gpuFreq + b2 * gpuFreq + c2;
  }
  return Math.min(phi, gpu.tdp_ref); // TDP CLAMP 
}


function updateValue(spanId, val) {
  document.getElementById(spanId).innerText = val;
}

let previousState = null;  // Global variable to store previous input values

function resetForm() {
  previousState = {};  // Clear previous state

  const allInputs = [
    "workload", "benchmarkId", "total_budget", "same_n_gpu",
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
    workload: "GROMACS", benchmarkId: 4, total_budget: 10000000, same_n_gpu: 240,
    C_node_server: 10000, C_node_infra: 5000, C_node_facility: 0, C_software: 5000,
    C_electricity: 0.21, C_PUE: 1.2, C_maintenance: 200, system_usage: 8760, lifetime: 5,
    W_node_baseline: 500, C_depreciation: 0, C_subscription: 0, C_uefficiency: 0,
    C_heatreuseperkWh: 0.01, Factor_heatreuse: 0
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
  document.getElementById("blogOutput").value = "";
  document.getElementById("download-csv").style.display = "none";
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

document.addEventListener("DOMContentLoaded", () => {
  toggleGPUFreqSlider();
  toggleGPUPowerSlider();
});

function getEtaNode() {
    return parseFloat(document.getElementById("eta_node").value) || 1;
}

function getEtaGPU() {
    return parseFloat(document.getElementById("eta_gpu").value) || 1;
}

function multiGpuEfficiency(n_gpu, per_node) {
    if (!n_gpu || !per_node) return 1; // fallback

    const n_nodes = n_gpu / per_node;

    // Read from sliders
    const slider_eta_node = getEtaNode();
    const slider_eta_gpu = getEtaGPU();

    // Combined efficiency
    return Math.pow(slider_eta_node, n_nodes - 1) * Math.pow(slider_eta_gpu, n_gpu - 1);
}

function calculate() {
console.log("calculate: GPU_data used for calculation:", GPU_data.map(g => g.name));

  const workload = document.getElementById("workload").value;
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

const mode = document.querySelector('input[name="calculationMode"]:checked').value;
let n_gpu_list = [];
if (mode === "budget") {
// ---------- Compute n_gpu ----------
 n_gpu_list = GPU_data.map((gpu, i) => {
  //const perf = gpu.perf[workload][benchmarkId]; // Use workload and benchmarkId
  //const power = gpu.power[workload][benchmarkId];
  const gpuFreq = getEffectiveGPUFreq(gpu);  
  const power = computeGpuPowerDVFS(gpu, gpu.power[workload][benchmarkId], gpuFreq, workload, benchmarkId);
  const basePerf = gpu.perf[workload][benchmarkId];
  const perf = basePerf * (gpuFreq / gpu.f_ref);
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

  console.log(`GPU: ${gpu.name}, A: ${A}, B: ${B}, n_gpu: ${n_gpu}`);
  return n_gpu;
});
} else if (mode === "power") {
	const maxPower = getSliderValue("max_total_power") * 1000; // convert kW to W
    n_gpu_list = GPU_data.map(gpu => {
        //const power = gpu.power[workload][benchmarkId];
		const gpuFreq = getEffectiveGPUFreq(gpu);  
  		const power = computeGpuPowerDVFS(gpu, gpu.power[workload][benchmarkId], gpuFreq, workload, benchmarkId);
        if (power === 0) return 0;

        const per_node = gpu.per_node;
        let n_gpu = Math.floor(maxPower / power);
        n_gpu = Math.floor(n_gpu / per_node) * per_node;

        if (n_gpu < per_node) return 0;

        return n_gpu;
    });
} else if (mode === "performance") {

  const targetPerf = getSliderValue("target_performance");

  n_gpu_list = GPU_data.map(gpu => {
    //const perf = gpu.perf[workload][benchmarkId];
	//const power = gpu.power[workload][benchmarkId];
	const gpuFreq = getEffectiveGPUFreq(gpu);  
  	const power = computeGpuPowerDVFS(gpu, gpu.power[workload][benchmarkId], gpuFreq, workload, benchmarkId);
  	const basePerf = gpu.perf[workload][benchmarkId];
  	const perf = basePerf * (gpuFreq / gpu.f_ref);
    if (!perf || perf <= 0) return 0;

    const per_node = gpu.per_node;

    let n_gpu = Math.ceil(targetPerf / perf);
    n_gpu = Math.ceil(n_gpu / per_node) * per_node;

    if (n_gpu < per_node) return 0;

    // --- NEW: budget feasibility check ---
    const W_gpu_total = power * system_usage * lifetime;
    const W_node_baseline_total = W_node_baseline * system_usage * lifetime;

    const gpu_cost_total = 
      gpu.cost * n_gpu +
      ((C_electricity - (F_heatreuse * C_heatreuseperkWh)) * PUE * (W_gpu_total * n_gpu + W_node_baseline_total * (n_gpu / per_node)) / 1000) +
      C_node_server * (n_gpu / per_node) +
      C_node_infra * (n_gpu / per_node) +
      C_node_facility * (n_gpu / per_node) +
      lifetime * C_maintenance * (n_gpu / per_node) +
      C_software + lifetime * (C_depreciation + C_subscription + C_uefficiency);

    if (gpu_cost_total > total_budget) {
      console.warn(`${gpu.name} exceeds available budget for target performance.`);
    }

    return n_gpu;
  });
} else if (mode === "gpu") {
    const fixedGpu = getSliderValue("same_n_gpu");

    n_gpu_list = GPU_data.map(gpu => {
        const per_node = gpu.per_node;
        // Round to nearest multiple of per_node
        let n_gpu = Math.floor(fixedGpu / per_node) * per_node;
        if (n_gpu < per_node) n_gpu = per_node;
        return n_gpu;
    });
}
	
// ---------- Compute cost breakdowns ----------
GPU_data.forEach((gpu, i) => {
  //const perf = gpu.perf[workload][benchmarkId]; // Use workload and benchmarkId
  //const power = gpu.power[workload][benchmarkId];
  const gpuFreq = getEffectiveGPUFreq(gpu);  
  const power = computeGpuPowerDVFS(gpu, gpu.power[workload][benchmarkId], gpuFreq, workload, benchmarkId);
  const basePerf = gpu.perf[workload][benchmarkId];
  const perf = basePerf * (gpuFreq / gpu.f_ref);
  if (perf === 0 || power === 0) return;

  let n_gpu = n_gpu_list[i];
  if (n_gpu === 0) return;

if (!gpu.per_node || gpu.per_node <= 0) {
  console.error(`Invalid per_node for GPU ${gpu.name}`, gpu);
  return;
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
  const eta_multiGPU = multiGpuEfficiency(n_gpu, per_node);
  const total_work = total_perf * eta_multiGPU * system_usage * lifetime / 24;
  const perf_per_tco = total_work / used_budget;
  const total_power = power * n_gpu;
  const power_per_tco = total_power / used_budget;
  const perf_per_watt_per_tco = total_work / total_power / used_budget;

	console.log("POWER DEBUG", {
  gpu: gpu.name,
  power,
  n_gpu,
  total_power
});
	
  // Initialize baseline_perf_tco with the first valid perf_per_tco
  if (baseline_perf_tco === 0) baseline_perf_tco = perf_per_tco;

  // Push results for this GPU
  window.results.push({
    name: gpu.name,
    n_gpu,
    total_cost: used_budget,
    perf_per_tco,
    power_per_tco,
    perf_per_watt_per_tco,
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

// Compute performance and power ratios
const performanceRatio = maxResult.perf_per_tco / minResult.perf_per_tco;
const powerRatio = maxResult.power_per_tco / minResult.power_per_tco;
const perfperpowerRatio = maxResult.perf_per_watt_per_tco / minResult.perf_per_watt_per_tco;

// Now let's append the comparison message to the screen below the table.
const comparisonMessageContainer = document.getElementById("comparison-message-container");

comparisonMessageContainer.classList.add('dark-message');

const comparisonMessage = `
  <p><strong>With the fixed budget of €${total_budget.toLocaleString()},</strong></p>
  <p>The ${maxResult.n_gpu} ${maxResult.name} GPUs (the highest work per TCO)</p>
  <p>deliver <strong>${performanceRatio.toFixed(1)}× more work per TCO</strong>, <strong>${powerRatio.toFixed(1)}× more power per TCO</strong> and <strong>${perfperpowerRatio.toFixed(1)}× more work per watt per TCO</strong> over its ${lifetime}-year lifetime</p>   
  <p>compared to the ${minResult.n_gpu} ${minResult.name} GPUs (the lowest work per TCO).</p>
`;

comparisonMessageContainer.innerHTML = comparisonMessage;

// Download CSV
document.getElementById('download-csv').style.display = 'block';

function downloadCSV2(data, filename = "gpu_tco_results.csv") {
  if (!Array.isArray(data) || data.length === 0) {
    console.error("Invalid data: must be a non-empty array.");
    return;
  }

  const headers = [
    "GPU",
    "#GPUs",
	"Total Perf (ns/day*atoms)",
	"Total Power (W)",
    "TCO (€)",
    "Work-per-TCO (ns/€ * atoms)",
    "Power-per-TCO (W/€)",
    "Work-per-watt-per-TCO (ns/W/€ * atoms)",
    "Baseline %"
  ];

  const rows = data.map(r => [
    r.name,
    r.n_gpu,
	r.performance.toFixed(1),
	r.power.toFixed(1),
    Math.round(r.total_cost),
    r.perf_per_tco.toFixed(1),
    r.power_per_tco.toFixed(1),
    r.perf_per_watt_per_tco.toFixed(3),
    r.baseline_pct.toFixed(2)
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");

  downloadCSV(csvContent, filename);
}

document.getElementById("download-csv").addEventListener("click", () => {
  downloadCSV2(window.results);
});

// Optional debug print
console.table(window.results.map(r => ({
  GPU: r.name,
  '#GPUs': r.n_gpu,
  'Total Perf (ns/day*atoms)': r.performance.toFixed(1),
  'Total Power (W)': r.power.toFixed(1),
  'TCO (€)': `€${Math.round(r.total_cost).toLocaleString()}`,
  'Work-per-TCO (ns/€ * atoms)': r.perf_per_tco.toFixed(1),
  'Power-per-TCO (W/€)': r.power_per_tco.toFixed(1), 
  'Work-per-watt-per-TCO (ns/W/€ * atoms)': r.perf_per_watt_per_tco.toFixed(1), 
  'Baseline %': r.baseline_pct.toFixed(2)
})));

// Find the maximum values for each column to use in heatmap color calculation
const maxTotalCost = Math.max(...window.results.map(r => r.total_cost));
const maxPerfPerTCO = Math.max(...window.results.map(r => r.perf_per_tco));
const maxPowerPerTCO = Math.max(...window.results.map(r => r.power_per_tco));
const maxPerfPerWattPerTCO = Math.max(...window.results.map(r => r.perf_per_watt_per_tco));
const maxBaselinePct = Math.max(...window.results.map(r => r.baseline_pct));
const maxGPUs = Math.max(...window.results.map(r => r.n_gpu)); // Find the max number of GPUs
const maxTotalPerf = Math.max(...window.results.map(r => r.performance));
const maxTotalPower = Math.max(...window.results.map(r => r.power));

// Create the table HTML dynamically
const tableHTML = `
  <table border="1" cellpadding="6">
    <thead>
      <tr>
        <th>GPU</th>
        <th>#GPUs</th>
		<th>Total Perf (ns/day*atoms)</th>      
    	<th>Total Power (W)</th> 
        <th>TCO (€)</th>
        <th>Work-per-TCO (ns/€ * atoms)</th>
		<th>Power-per-TCO (W/€)</th>
        <th>Work-per-watt-per-TCO (ns/W/€ * atoms)</th>
        <th>Baseline (%)</th>
      </tr>
    </thead>
    <tbody>
      ${window.results.map(r => `
        <tr>
          <td>${r.name}</td>
          <td style="background-color:${getHeatmapColor(r.n_gpu, maxGPUs)}">${r.n_gpu}</td>
		  <td style="background-color:${getHeatmapColor(r.performance, maxTotalPerf)}">${r.performance.toExponential(2)}</td> 
      	  <td style="background-color:${getHeatmapColor(r.power, maxTotalPower)}">${r.power.toExponential(2)}</td>       
          <td style="background-color:${getHeatmapColor(r.total_cost, maxTotalCost)}">${r.total_cost.toExponential(2)}</td>
          <td style="background-color:${getHeatmapColor(r.perf_per_tco, maxPerfPerTCO)}">${r.perf_per_tco.toExponential(2)}</td>
		  <td style="background-color:${getHeatmapColor(r.power_per_tco, maxPowerPerTCO)}">${r.power_per_tco < 1 ? r.power_per_tco.toExponential(2) : r.power_per_tco.toFixed(1)}</td>
          <td style="background-color:${getHeatmapColor(r.perf_per_watt_per_tco, maxPerfPerWattPerTCO)}">${r.perf_per_watt_per_tco.toExponential(2)}</td>
          <td style="background-color:${getHeatmapColor(r.baseline_pct, maxBaselinePct)}">${(r.baseline_pct).toFixed(2)}</td>
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
  name: 'Work-per-TCO (ns/€ * atoms)',
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
    size: 31
  }
};

// Layout with double Y axes
const barLayout = {
  font: {
    family: 'Arial, sans-serif',
    size: 31,
    color: 'black'
  },

  barmode: 'group',

  xaxis: {
    title: { text: 'GPU Type', font: { size: 31 } ,  standoff: 100 },
    tickfont: { size: 31 },
    tickangle: -45
  },

  yaxis: {
    title: { text: 'Work-per-TCO (ns/€ * atoms)', font: { size: 31 },  standoff: 100 },
    tickfont: { size: 31 },
    rangemode: 'tozero'
  },

  yaxis2: {
    title: { text: '#GPUs', font: { size: 31, color: 'red' },  standoff: 100 },
    tickfont: { size: 31, color: 'red' },
    overlaying: 'y',
    side: 'right'
  },

  legend: { font: { size: 31 }, orientation: 'h', y: -0.1 },
  height: 500,
  margin: { t: 60, b: 100, l: 80, r: 80 }
};

// ---------- Plotly Bar Chart: Power per TCO (Left Y-Axis) + #GPUs (Right Y-Axis) ----------
const powerPerTCOTrace = {
  x: barLabels,
  y: nonzeroResults.map(result => result.power_per_tco),
  type: 'bar',
  name: 'Power-per-TCO (W/€)',
  marker: { color: 'rgba(255, 165, 0, 0.6)', line: { color: 'orange', width: 1 } },
  yaxis: 'y1'
};

const gpuTrace2 = {
  x: barLabels,
  y: gpuCounts,
  type: 'scatter',
  mode: 'lines+markers+text',
  name: '#GPUs',
  yaxis: 'y2',
  line: { color: 'red', width: 2 },
  marker: { color: 'red', size: 6 },
  text: gpuCounts.map(String),
  textposition: 'top center',
  textfont: { color: 'red', size: 16 }
};

const powerLayout = {
  title: '',
  barmode: 'group',
  xaxis: { title: 'GPU Type', tickangle: -45 },
  yaxis: { title: 'Power-per-TCO (W/€)', rangemode: 'tozero', showgrid: true },
  yaxis2: { title: '#GPUs', overlaying: 'y', side: 'right', showgrid: false, tickformat: ',d', color: 'red' },
  legend: { orientation: 'h', y: -0.2 },
  height: 500,
  margin: { t: 60, b: 100, l: 80, r: 80 }
};

// ---------- Plotly Bar Chart: Perf per Watt per TCO (Left Y-Axis) + #GPUs (Right Y-Axis) ----------
const perfPerWattTrace = {
  x: barLabels,
  y: nonzeroResults.map(result => result.perf_per_watt_per_tco),
  type: 'bar',
  name: 'Work-per-watt-per-TCO (ns/W/€ * atoms)',
  marker: { color: 'rgba(0, 200, 200, 0.6)', line: { color: 'teal', width: 1 } },
  yaxis: 'y1'
};

const gpuTrace3 = {
  x: barLabels,
  y: gpuCounts,
  type: 'scatter',
  mode: 'lines+markers+text',
  name: '#GPUs',
  yaxis: 'y2',
  line: { color: 'red', width: 2 },
  marker: { color: 'red', size: 6 },
  text: gpuCounts.map(String),
  textposition: 'top center',
  textfont: { color: 'red', size: 16 }
};

// Layout
const perfWattLayout = {
  title: '',
  barmode: 'group',
  xaxis: { title: 'GPU Type', tickangle: -45, font: { size: 16 }},
  yaxis: { title: 'Work-per-watt-per-TCO (ns/W/€ * atoms)', rangemode: 'tozero', showgrid: true, font: { size: 16 } },
  yaxis2: { title: '#GPUs', overlaying: 'y', side: 'right', showgrid: false, tickformat: ',d', color: 'red', font: { size: 16 } },
  legend: { orientation: 'h', y: -0.2 },
  height: 500,
  margin: { t: 60, b: 100, l: 80, r: 80 }
};

function renderCharts() {
  if (!document.getElementById('power-chart')) {
    console.error("Power chart div not found!");
    return;
  }
	Plotly.newPlot('gpu-chart', [perfTrace, gpuTrace], barLayout, { responsive: true });
	Plotly.newPlot('power-chart', [powerPerTCOTrace, gpuTrace2], powerLayout, { responsive: true });
	Plotly.newPlot('perf-watt-chart', [perfPerWattTrace, gpuTrace3], perfWattLayout, { responsive: true });
}

// Call this after your nonzeroResults is ready
renderCharts();

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

// ---------- Disable other sliders if the user selects Fix Budget and vice versa ----------
function toggleSliders() {
  const checkedRadio = document.querySelector('input[name="calculationMode"]:checked');
  if (!checkedRadio) return;

  const mode = checkedRadio.value;

  // Hide all slider containers
  document.querySelectorAll('.mode-slider').forEach(sliderDiv => {
    sliderDiv.style.display = 'none';
  });

  // Show only the slider corresponding to the selected mode
  const activeSlider = document.getElementById(`slider_${mode}`);
  if (activeSlider) activeSlider.style.display = 'block';
}

// Initialize on page load and when mode changes
function initSliderToggle() {
  toggleSliders(); // initial setup

  document.querySelectorAll('input[name="calculationMode"]').forEach(el => {
    el.addEventListener('change', toggleSliders);
  });
}

// Run initialization after DOM is ready
window.addEventListener('DOMContentLoaded', initSliderToggle);


// ---------- Show Performance Model ----------
document.getElementById("showPerfModelBtn").addEventListener("click", () => {
    showPerfModel();
});

function showPerfModel() {
    const rows = GPU_data.map(gpu => {
        const f_ref = GPU_F_REF[gpu.name] ?? "N/A";
        const perfRef = gpu.perf ? gpu.perf : "N/A";

        if (!perfRef || Object.keys(perfRef).length === 0) {
            return `
            <tr>
                <td>${gpu.name}</td>
                <td>${f_ref} MHz</td>
                <td>No performance data available</td>
            </tr>
            `;
        }

        // Take the first workload & benchmark for display
        const firstWorkload = Object.keys(perfRef)[0];
        const firstBenchmark = Object.keys(perfRef[firstWorkload])[0];
        const basePerf = perfRef[firstWorkload][firstBenchmark];

        const perfFormula = `P(f_GPU) = ${basePerf} * (f_GPU / ${f_ref})`;

        return `
        <tr>
            <td>${gpu.name}</td>
            <td>${f_ref} MHz</td>
            <td style="white-space: pre-line; font-family: monospace;">${perfFormula}</td>
        </tr>
        `;
    }).join("");

    // Create modal
    const modal = document.createElement("div");
    modal.style.position = "fixed";
    modal.style.top = "5%";
    modal.style.left = "5%";
    modal.style.width = "90%";
    modal.style.height = "90%";
    modal.style.backgroundColor = "white";
    modal.style.border = "2px solid #333";
    modal.style.padding = "20px";
    modal.style.zIndex = 1000;
    modal.style.overflowY = "auto";
    modal.innerHTML = `
        <h2>GPU Performance Model</h2>
        <table style="width:100%; border-collapse: collapse;" border="1">
            <thead>
                <tr>
                    <th>GPU</th>
                    <th>f_base (MHz)</th>
                    <th>Performance Model P(f_GPU) P_base * (f_GPU / f_base);</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
        <br>
        <button id="closeModalPerfBtn">Close</button>
    `;

    document.body.appendChild(modal);

    // Close modal
    document.getElementById("closeModalPerfBtn").addEventListener("click", () => {
        document.body.removeChild(modal);
    });
}

// ---------- Show Power Plots (All Benchmarks, All GPUs) ----------
document.getElementById("showPerfPlotBtn").addEventListener("click", () => {
    showPerfPlotsAllBenchmarks();
});

function showPerfPlotsAllBenchmarks() {
    const container = document.getElementById("perfPlotContainer");
    if (!container) {
        console.error("perfPlotContainer not found in DOM");
        return;
    }

    container.innerHTML = "";
    container.style.display = "flex";
    container.style.flexWrap = "wrap";
    container.style.gap = "20px";
    container.style.justifyContent = "center";

    const workload = document.getElementById("workload").value;

    const benchmarkIds = Object.keys(GPU_data[0].perf[workload]);

    benchmarkIds.forEach(benchmarkId => {
        const plotWrapper = document.createElement("div");
        plotWrapper.style.width = "420px";
        plotWrapper.style.height = "320px";
        plotWrapper.style.border = "1px solid #ccc";
        plotWrapper.style.padding = "10px";
        plotWrapper.style.background = "#fafafa";

        const title = document.createElement("h4");
        title.textContent = `Performance Model – ${workload}, Benchmark ${benchmarkId}`;
        title.style.textAlign = "center";

        const canvas = document.createElement("canvas");
        canvas.height = 300;
        canvas.style.height = "380px";

        plotWrapper.appendChild(title);
        plotWrapper.appendChild(canvas);
        container.appendChild(plotWrapper);

        const ctx = canvas.getContext("2d");

        let labels = null;
        const datasets = [];

        GPU_data.forEach(gpu => {
            const f_ref = GPU_F_REF[gpu.name];
            const basePerf = gpu.perf?.[workload]?.[benchmarkId];
            if (!f_ref || !basePerf) return;

            const freqs = [];
            const perfs = [];

            const maxF = f_ref * 1.2;
            const step = 15;

            for (let f = 0; f <= maxF; f += step) {
                freqs.push(Math.round(f));
                const perf = basePerf * (f / f_ref);
                perfs.push(perf);
            }

            if (!labels) labels = freqs;

            datasets.push({
                label: gpu.name,
                data: perfs,
                fill: false,
                tension: 0.15,
                borderWidth: 1.5,
                pointRadius: 1
            });
        });

        new Chart(ctx, {
            type: "line",
            data: {
                labels,
                datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: { padding: { bottom: 50 } },
                plugins: { legend: { position: "top" } },
                scales: {
                    x: { 
                        title: { display: true, text: "GPU Graphics Frequency (MHz)" },
                        ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 6 }
                    },
                    y: {
                        min: 0,
                        title: { display: true, text: "Performance P(f_GPU)" }
                    }
                }
            }
        });
    });
}

// ---------- Show Power Model ----------
document.getElementById("showPowerModelBtn").addEventListener("click", () => {
    showPowerModel();
});

function showPowerModel() {
    const rows = GPU_data.map(gpu => {
        const f_ref = GPU_F_REF[gpu.name] ?? "N/A";
        const tdp_ref = GPU_TDP_REF[gpu.name] ?? "N/A";
        const dvfs = gpu.DVFS_PARAMS;

        if (!dvfs || Object.keys(dvfs).length === 0) {
            return `
            <tr>
                <td>${gpu.name}</td>
                <td>${f_ref} MHz</td>
                <td>${tdp_ref} W</td>
                <td>No DVFS parameters available</td>
            </tr>
            `;
        }

        // Take the first workload & benchmark for display
        const firstWorkload = Object.keys(dvfs)[0];
        const firstBenchmark = Object.keys(dvfs[firstWorkload])[0];
        const params = dvfs[firstWorkload][firstBenchmark];

        const phiFormula = `
φ(f_GPU) =
{
  ${params.b1} * f_GPU + ${params.c1},          if f_GPU ≤ ${params.f_t} * f_ref
  ${params.a2} * f_GPU² + ${params.b2} * f_GPU + ${params.c2},  if f_GPU > ${params.f_t} * f_ref
}`;

        return `
        <tr>
            <td>${gpu.name}</td>
            <td>${f_ref} MHz</td>
            <td>${tdp_ref} W</td>
            <td style="white-space: pre-line; font-family: monospace;">${phiFormula}</td>
        </tr>
        `;
    }).join("");

    // Create modal
    const modal = document.createElement("div");
    modal.style.position = "fixed";
    modal.style.top = "5%";
    modal.style.left = "5%";
    modal.style.width = "90%";
    modal.style.height = "90%";
    modal.style.backgroundColor = "white";
    modal.style.border = "2px solid #333";
    modal.style.padding = "20px";
    modal.style.zIndex = 1000;
    modal.style.overflowY = "auto";
    modal.innerHTML = `
        <h2>GPU Power Model</h2>
        <table style="width:100%; border-collapse: collapse;" border="1">
            <thead>
                <tr>
                    <th>GPU</th>
                    <th>f_base (MHz)</th>
                    <th>W_TDP (W)</th>
                    <th>Power Model W(f_GPU)=min(W_TDP, φ(f_GPU))</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
        <br>
        <button id="closeModalBtn">Close</button>
    `;

    document.body.appendChild(modal);

    // Close modal
    document.getElementById("closeModalBtn").addEventListener("click", () => {
        document.body.removeChild(modal);
    });
}

// ---------- Show Power Plots (All Benchmarks, All GPUs) ----------
document.getElementById("showPowerPlotBtn").addEventListener("click", () => {
  showPowerPlotsAllBenchmarks();
});

function showPowerPlotsAllBenchmarks() {
  const container = document.getElementById("powerPlotContainer");
  if (!container) {
    console.error("powerPlotContainer not found in DOM");
    return;
  }

  // --- NEW: side-by-side layout ---
  container.innerHTML = "";
  container.style.display = "flex";
  container.style.flexWrap = "wrap";
  container.style.gap = "20px";
  container.style.justifyContent = "center";

  const workload = document.getElementById("workload").value;

  // Use benchmark list from first GPU
  const benchmarkIds = Object.keys(GPU_data[0].DVFS_PARAMS[workload]);

  benchmarkIds.forEach(benchmarkId => {

    // --- NEW: wrapper per plot ---
    const plotWrapper = document.createElement("div");
    plotWrapper.style.width = "420px";
	plotWrapper.style.height = "320px";
    plotWrapper.style.border = "1px solid #ccc";
    plotWrapper.style.padding = "10px";
    plotWrapper.style.background = "#fafafa";

    const title = document.createElement("h4");
    title.textContent = `DVFS Power Model – ${workload}, Benchmark ${benchmarkId}`;
    title.style.textAlign = "center";

    const canvas = document.createElement("canvas");
    canvas.height = 300;
	canvas.style.height = "380px";

    plotWrapper.appendChild(title);
    plotWrapper.appendChild(canvas);
    container.appendChild(plotWrapper);

    const ctx = canvas.getContext("2d");

    let labels = null;
    const datasets = [];

    GPU_data.forEach(gpu => {
      const f_ref = GPU_F_REF[gpu.name];
      const dvfs = gpu.DVFS_PARAMS?.[workload]?.[benchmarkId];
      if (!f_ref || !dvfs) return;

      const freqs = [];
      const powers = [];

      const maxF = f_ref * 1.2;
      const step = 15;

      for (let f = 0; f <= maxF; f += step) {
        freqs.push(Math.round(f));

		const W_TDP  = gpu.tdp_ref;
		
		if (!W_TDP) return;
				
		let phi;
		if (f <= dvfs.f_t) {
		  phi = dvfs.b1 * f + dvfs.c1;
		} else {
		  phi = dvfs.a2 * f * f + dvfs.b2 * f + dvfs.c2;
		}
		
		const power = Math.min(W_TDP, phi);
		powers.push(power);
      }

      if (!labels) labels = freqs;

      datasets.push({
        label: gpu.name,
        data: powers,
        fill: false,
        tension: 0.15,
        borderWidth: 1.5,
        pointRadius: 1
      });
    });

    new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets
      },
      options: {
		  responsive: true,
		  maintainAspectRatio: false,
		  layout: {
		    padding: {
		      bottom: 50   // space for x-axis labels
		    }
		  },
		  plugins: {
		    legend: { position: "top" }
		  },
		  scales: {
		    x: {
		      title: {
		        display: true,
		        text: "GPU Graphics Frequency (MHz)"
		      },
		      ticks: {
		        maxRotation: 0,
		        autoSkip: true,
		        maxTicksLimit: 6
		      }
		    },
		  y: {
		  min: 0,
		  title: { display: true, text: "Power W(f_GPU)=min(W_TDP, φ(f_GPU))" }
		}
        }
      }
    });
  });
}
	
// ---------- Parameter Sensitivities Analysis (% Uncertainty Contribution) ----------
const elasticityLabels = [
  'GPU (€)', 'Node Server (€)', 'Node Infrastructure (€)', 'Node Facility (€)', 'Software (€)',
  'Electricity (€/kWh)', 'Heat Reuse Revenue (€/kWh)', 'PUE', 'Node Maintenance (€/year)', 'System Usage (hrs/year)', 
  'System Lifetime (years)', 'Node Baseline Power w/o GPUs (W)',  
  'Depreciation cost (€/year)', 'Software Subscription (€/year)', 'Utilization Inefficiency (€/year)'
];

// Parameter order MUST match your base[] vector
const uncertaintyParamIds = [
  "GPU_cost",              // placeholder (GPU handled separately)
  "C_node_server",
  "C_node_infra",
  "C_node_facility",
  "C_software",
  "C_electricity",
  "C_heatreuseperkWh",
  "C_PUE",
  "C_maintenance",
  "system_usage",
  "lifetime",
  "W_node_baseline",
  "C_depreciation",
  "C_subscription",
  "C_uefficiency"
];

// Default realistic fallback (used only if sliders missing)
const defaultRealisticUncertainty = [
  0.10, 0.15, 0.15, 0.15, 0.10,
  0.25, 0.60, 0.08, 0.30, 0.20,
  0.30, 0.10, 0.20, 0.05, 0.25
];


function getActiveUncertaintyVector() {
  const globalSlider = document.getElementById("globalUncertainty");
  const globalVal = globalSlider ? parseFloat(globalSlider.value) / 100 : 0;

  const ranges = new Array(15);

  if (globalVal > 0) {
    // GLOBAL MODE → uniform ±%
    ranges.fill(globalVal);

    // Disable individual sliders
    document.querySelectorAll(".paramUncertainty").forEach(sl => {
      sl.disabled = true;
    });
  } else {
    // INDIVIDUAL MODE
    document.querySelectorAll(".paramUncertainty").forEach(sl => {
      sl.disabled = false;
    });

    ranges[0] = defaultRealisticUncertainty[0]; // GPU cost (no slider)

    for (let i = 1; i < uncertaintyParamIds.length; i++) {
      const paramId = uncertaintyParamIds[i];
      const slider = document.querySelector(
        `.paramUncertainty[data-param="${paramId}"]`
      );

      ranges[i] = slider
        ? parseFloat(slider.value) / 100
        : defaultRealisticUncertainty[i];
    }
  }

  return ranges;
}

const globalSlider = document.getElementById("globalUncertainty");
const globalLockIcon = document.getElementById("globalLockIcon");

// Central function to sync sliders and lock icon
function updateSlidersFromGlobal() {
  const globalVal = parseFloat(globalSlider.value);
  const isGlobal = globalVal > 0;

  // Update global display
  document.getElementById("v_globalUncertainty").innerText = globalVal;

  // Show/hide lock
globalLockIcon.style.display = isGlobal ? "inline-block" : "none";

  // Update individual sliders
  document.querySelectorAll(".paramUncertainty").forEach(slider => {
    const span = slider.parentElement.querySelector(".uncValue");
    if (isGlobal) {
      slider.disabled = true;
      slider.value = Math.round(globalVal);  // <-- ensure integer 0-100
      if (span) span.innerText = slider.value;
    } else {
      slider.disabled = false;
      // Do NOT overwrite value in individual mode
      if (span) span.innerText = slider.value;
    }
  });
}

// Listen for global slider changes
globalSlider.addEventListener("input", updateSlidersFromGlobal);

// Listen for individual sliders to update their displayed value dynamically
document.addEventListener("input", e => {
  if (e.target.classList.contains("paramUncertainty")) {
    const span = e.target.parentElement.querySelector(".uncValue");
    if (span) span.innerText = e.target.value;
  }
});

// Initialize sliders on page load
updateSlidersFromGlobal();

const ACTIVE_METRICS = ["tco", "perf_per_tco", "power_per_tco", "perf_per_watt_per_tco"];

// ---------- Compute Sensitivities for all metrics ----------
const normalizeAcrossDimension = arr => {
    const transposed = arr[0] ? arr[0].map((_, i) => arr.map(row => row[i])) : [];
    const normalizedTransposed = transposed.map(row => {
        const plainRow = Array.from(row);
        const maxVal = Math.max(...plainRow.map(Math.abs));
        
        // ✅ CRITICAL FIX: Relax the numerical safeguard to prevent zeroing small Sobol values.
        if (maxVal < 1e-15) return plainRow.map(() => 0); 
        
        return plainRow.map(v => (v / maxVal) * 100);
    });
    return normalizedTransposed;
};
const safeNormalizeAcrossDimension = arr => arr && arr.length ? normalizeAcrossDimension(arr) : [];
const safeTranspose = m => m.length && m[0] ? m[0].map((_, i) => m.map(row => row[i])) : [];
const safeMakePlainArray = arr => arr && arr.length ? arr.map(row => Array.from(row)) : [];
const allElasticities = {};
const sobolIndicesOptimized = {};
const monteCarloParamResults = {};

ACTIVE_METRICS.forEach(metric => {
    // Elasticity
    const elasticities = window.results.map((r, i) => {
        const gpu = GPU_data[r.originalGPUIndex];
        if (!gpu) return null;

        const n_gpu = r.n_gpu;
        const n_nodes = n_gpu / gpu.per_node;
        //const perf = gpu.perf[workload][benchmarkId];
        //const power = gpu.power[workload][benchmarkId];
		const gpuFreq = getEffectiveGPUFreq(gpu);  
  		const power = computeGpuPowerDVFS(gpu, gpu.power[workload][benchmarkId], gpuFreq, workload, benchmarkId);
  		const basePerf = gpu.perf[workload][benchmarkId];
  		const perf = basePerf * (gpuFreq / gpu.f_ref);
        const total_perf = perf * n_gpu;
        const total_power = power * n_gpu;
		const eta_multiGPU = multiGpuEfficiency(n_gpu, gpu.per_node);
  		const total_work = total_perf * eta_multiGPU * system_usage * lifetime / 24;
        const W_gpu_total = (power * system_usage * lifetime * n_gpu) / 1000;
        const W_node_total = (W_node_baseline * system_usage * lifetime * n_nodes) / 1000;
        const TCO = r.total_cost;

        let metricValue;
        switch (metric) {
            case "tco": metricValue = TCO; break;
            case "perf_per_tco": metricValue = total_work / TCO; break;
            case "power_per_tco": metricValue = total_power / TCO; break;
            case "perf_per_watt_per_tco": metricValue = total_work / total_power / TCO; break;
            default: metricValue = undefined;
        }
        if (metricValue === undefined || metricValue === 0) return null;

        const baseValues = [
            gpu.cost, C_node_server, C_node_infra, C_node_facility, C_software,
            C_electricity, C_heatreuseperkWh, PUE, C_maintenance, system_usage,
            lifetime, W_node_baseline, C_depreciation, C_subscription, C_uefficiency
        ];

        const dTCO = [
            n_gpu,
            n_nodes, n_nodes, n_nodes,
            1,
            PUE * (W_node_total + W_gpu_total),
            -PUE * (W_node_total + W_gpu_total),
            (C_electricity - (F_heatreuse * C_heatreuseperkWh)) * (W_node_total + W_gpu_total),
            n_nodes * lifetime,
            (C_electricity - (F_heatreuse * C_heatreuseperkWh)) * PUE * ((W_node_baseline * lifetime * n_nodes) + (power * lifetime * n_gpu)) / 1000,
            ((C_electricity - (F_heatreuse * C_heatreuseperkWh)) * PUE * ((W_node_baseline * system_usage * n_nodes) + (power * system_usage * n_gpu)) / 1000) + (C_maintenance * n_nodes) + C_depreciation + C_subscription + C_uefficiency,
            ((C_electricity - (F_heatreuse * C_heatreuseperkWh)) * PUE * system_usage * lifetime * n_nodes) / 1000,
            lifetime, lifetime, lifetime
        ];

        return dTCO.map((d, idx) => metric === "tco" ? 100 * (baseValues[idx] / TCO) * d : -100 * (baseValues[idx] / TCO) * d);
    }).filter(Boolean);

    // Safe assignments
	allElasticities[metric] = elasticities.length ? safeMakePlainArray(safeTranspose(elasticities)) : [];
	sobolIndicesOptimized[metric] = computeTotalOrderSobolNormalized(2000, metric) || [];
	monteCarloParamResults[metric] = monteCarloUncertaintyNormalized(2000, metric) || [];
});

// ---------- Shared Cost Evaluation Function ----------
function evaluateMetric(params, gpuIndex, metricKey) {
  const r = window.results[gpuIndex];
  const gpu = GPU_data[r.originalGPUIndex];

  const n_gpu = r.n_gpu;
  const n_nodes = n_gpu / gpu.per_node;
  //const perf = gpu.perf[workload][benchmarkId];
  //const power = gpu.power[workload][benchmarkId];
  const gpuFreq = getEffectiveGPUFreq(gpu);  
  const power = computeGpuPowerDVFS(gpu, gpu.power[workload][benchmarkId], gpuFreq, workload, benchmarkId);
  const basePerf = gpu.perf[workload][benchmarkId];
  const perf = basePerf * (gpuFreq / gpu.f_ref);

  const [
    C_gpu,
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
  ] = params;

  const W_gpu_total = power * system_usage * lifetime;
  const W_node_total = W_node_baseline * system_usage * lifetime;

  const TCO =
    n_gpu * C_gpu +
    n_nodes * (C_node_server + C_node_infra + C_node_facility) +
    C_software +
    (C_electricity - F_heatreuse * C_heatreuseperkWh) *
      PUE *
      ((W_node_total * n_nodes) + (W_gpu_total * n_gpu)) / 1000 +
    n_nodes * C_maintenance * lifetime +
    lifetime * (C_depreciation + C_subscription + C_uefficiency);

  const total_perf = perf * n_gpu;
  const total_power = power * n_gpu;
  const eta_multiGPU = multiGpuEfficiency(n_gpu, gpu.per_node);
  const total_work = total_perf * eta_multiGPU * system_usage * lifetime / 24;	

  switch (metricKey) {
    case "tco":
      return TCO;
    case "perf_per_tco":
      return total_work / TCO;
    case "power_per_tco":
      return total_power / TCO;
    case "perf_per_watt_per_tco":
      return total_work / total_power / TCO;
    default:
      throw new Error("Unknown metric: " + metricKey);
  }
}

// ---------- Sobol Total-Order Sensitivity (robust) ----------
function computeTotalOrderSobolNormalized(numSamples = 2000, metric) {
  const numGPUs = window.results.length;
  const numParams = 15;
  const sobolResults = new Array(numGPUs);
  const activeUncertainty = getActiveUncertaintyVector();

function generatePerturbations(N, k, ranges) {
  const p = new Float64Array(N * k);
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < k; j++) {
      const r = ranges[j];
      p[i * k + j] = (Math.random() - 0.5) * 2 * r; // uniform [0,1] shifts to [-0.5, 0.5] and then scales to [-r, r], i.e., ±r*100%
    }
  }
  return p;
}

  for (let g = 0; g < numGPUs; g++) {
    const gpu = GPU_data[window.results[g].originalGPUIndex];
    const base = [
      gpu.cost, C_node_server, C_node_infra, C_node_facility, C_software,
      C_electricity, C_heatreuseperkWh, PUE, C_maintenance, system_usage,
      lifetime, W_node_baseline, C_depreciation, C_subscription, C_uefficiency
    ];

    // Normalize to ~1
    const normBase = base.map(v => v === 0 ? 0.001 : v); // numerical safeguard only: Zero baselines are replaced with a small value 0.001 to prevent zero variance, which would otherwise make Sobol indices meaningless and the Monte Carlo standard deviation zero.

	const perturbA = generatePerturbations(numSamples, numParams, activeUncertainty);
	const perturbB = generatePerturbations(numSamples, numParams, activeUncertainty);

    const A = [], B = [];

    for (let i = 0; i < numSamples; i++) {
      const rowA = new Float64Array(numParams);
      const rowB = new Float64Array(numParams);
      for (let j = 0; j < numParams; j++) {
        rowA[j] = normBase[j] * (1 + perturbA[i * numParams + j]);
        rowB[j] = normBase[j] * (1 + perturbB[i * numParams + j]);
      }
      A.push(rowA);
      B.push(rowB);
    }

    const Y_A = A.map(a => evaluateMetric(a, g, metric)); 
    
    // Check if any metric evaluation is invalid (e.g., division by zero leading to Infinity/NaN)
    if (Y_A.some(v => !isFinite(v))) {
        sobolResults[g] = Array.from(new Float64Array(numParams).fill(0));
        continue;
    }

    const meanYA = Y_A.reduce((a, b) => a + b, 0) / numSamples;
    const varY = Y_A.reduce((s, y) => s + (y - meanYA) ** 2, 0) / (numSamples - 1);
    
    // ✅ CRITICAL FIX: Check for negligible variance (division by zero trap)
    if (!isFinite(varY) || varY <= 1e-15) { // Relaxed tolerance to 1e-15
      sobolResults[g] = Array.from(new Float64Array(numParams).fill(0));
      continue;
    }
    
    // Note: The redundant `if (!isFinite(varY) || varY <= 1e-12)` block below the mean/var calculation was removed.
    
    const S_T = new Float64Array(numParams);

    for (let j = 0; j < numParams; j++) {
      let sumSqDiff = 0;
      for (let i = 0; i < numSamples; i++) {
        const hybrid = new Float64Array(A[i]);
        hybrid[j] = B[i][j];
        sumSqDiff += (Y_A[i] - evaluateMetric(hybrid, g, metric)) ** 2;
      }
      
      // Calculate Sobol index only if sumSqDiff is finite (preventing secondary NaN)
      if (isFinite(sumSqDiff)) {
        S_T[j] = 100 * (sumSqDiff / (2 * varY * numSamples)); 
      } else {
        S_T[j] = 0;
      }
    }

    // ✅ Final fix: Ensure the raw Sobol index array is a plain array for other functions to process.
    sobolResults[g] = Array.from(S_T);
  }

  return sobolResults;
}

// ---------- Monte Carlo (% std / base cost) ----------
function monteCarloUncertaintyNormalized(numSamples = 1000, metric, perturbation = 0.2) {
  const results = [];
  const numParams = 15;
  const activeUncertainty = getActiveUncertaintyVector();

  for (let i = 0; i < window.results.length; i++) {
    const gpu = GPU_data[window.results[i].originalGPUIndex];
    const base = [
      gpu.cost, C_node_server, C_node_infra, C_node_facility, C_software,
      C_electricity, C_heatreuseperkWh, PUE, C_maintenance, system_usage,
      lifetime, W_node_baseline, C_depreciation, C_subscription, C_uefficiency
    ];

    const normBase = base.map(v => v === 0 ? 0.001 : v); // numerical safeguard only: zero baselines are replaced with a small value 0.001 to prevent zero variance, which would otherwise make Sobol indices meaningless and the Monte Carlo standard deviation zero.
    const baseMetric = evaluateMetric(normBase, i, metric);
    const stds = new Float64Array(numParams);

    for (let j = 0; j < numParams; j++) {
      const samples = new Float64Array(numSamples);
      for (let k = 0; k < numSamples; k++) {
        const params = [...normBase];
		params[j] *= 1 + (Math.random() - 0.5) * 2 * activeUncertainty[j];
        samples[k] = evaluateMetric(params, i, metric);
      }
      const mean = samples.reduce((s, v) => s + v, 0) / numSamples;
      const variance = samples.reduce((s, v) => s + (v - mean) ** 2, 0) / (numSamples - 1);
      stds[j] = 100 * (Math.sqrt(variance) / Math.abs(baseMetric));
    }

    results.push(Array.from(stds));
  }

  return results;
}

// ---------- Helper Function ----------
const transpose = m => m[0].map((_, i) => m.map(row => row[i]));
const flatten2D = arr => Array.isArray(arr) ? arr.reduce((acc, row) => acc.concat(row), []) : [];

// ---------- Prepare Heatmap Data ----------
// Elasticity: keep as before (Transposed: Parameters x GPUs)
const zElasticity = {}; // store per metric

ACTIVE_METRICS.forEach(metric => {
    zElasticity[metric] = allElasticities[metric] || [[]]; // fallback to empty 2D array
});

// Sobol
const zSobol = {};

ACTIVE_METRICS.forEach(metric => {
  const raw = sobolIndicesOptimized[metric]; // [GPU][parameter]

  if (!Array.isArray(raw) || !raw.length) {
    zSobol[metric] = [];
    return;
  }

  // Normalize per parameter across GPUs
  const normalized = normalizeAcrossDimension(raw); // [parameter][GPU]

  // CRITICAL: convert Float64Array → Array
  zSobol[metric] = normalized.map(row => Array.from(row));
});

console.log(
  "Sobol raw max (TCO):",
  Math.max(...flatten2D(sobolIndicesOptimized.tco))
);

console.log(
  "Sobol heatmap max (TCO):",
  Math.max(...flatten2D(zSobol.tco))
);

// Monte Carlo
const zMonteCarlo = {};
ACTIVE_METRICS.forEach(metric => {
    zMonteCarlo[metric] = safeMakePlainArray(safeNormalizeAcrossDimension(monteCarloParamResults[metric] || [[]]));
});

// Compute global max for scaling per metric
const zMaxElasticity = {};
ACTIVE_METRICS.forEach(metric => {
    zMaxElasticity[metric] = Math.max(...flatten2D(zElasticity[metric]).map(Math.abs), 1);
});
const zMaxSobol = 100; // Normalized to 100
const zMaxMonteCarlo = 100; // Normalized to 100

// ---------- Heatmap Traces ----------
const heatmapData = []; // declare first
const metricTitles = {
  tco: "TCO",
  perf_per_tco: "Work-per-TCO",
  power_per_tco: "Power-per-TCO",
  perf_per_watt_per_tco: "Work-per-Watt-per-TCO"
};
const metricSelector = document.getElementById("metricSelector");
ACTIVE_METRICS.forEach(metric => {
    const opt = document.createElement("option");
    opt.value = metric;
    opt.text = metricTitles[metric];
    metricSelector.appendChild(opt);
});
metricSelector.addEventListener("change", e => {
    const metric = e.target.value;
    const visibility = heatmapData.map((_, i) => {
        return Math.floor(i / 3) === ACTIVE_METRICS.indexOf(metric);
    });
    Plotly.update("sensitivityHeatmaps", { visible: visibility });
});

ACTIVE_METRICS.forEach((metric, metricIdx) => {
    const xLabels = window.results.map(r => r.name);

    // Elasticity
    heatmapData.push({
        z: zElasticity[metric],
        x: xLabels,
        y: elasticityLabels,
        type: "heatmap",
        colorscale: [[0,"rgb(0,0,255)"], [0.5,"white"], [1,"rgb(255,0,0)"]],
        zmin: -zMaxElasticity[metric],
        zmax: zMaxElasticity[metric],
        colorbar: { title: "Elasticity (%)", x: 0.97, len: 0.9, y: 0.5 },
        visible: metric === "tco",
        name: `Elasticity-${metric}`,
        xaxis: "x1",
        yaxis: "y1"
    });

    // Sobol (shared colorbar)
    heatmapData.push({
        z: zSobol[metric],
        x: xLabels,
        y: elasticityLabels,
        type: "heatmap",
        colorscale: [[0,"rgb(0,0,255)"], [0.5,"white"], [1,"rgb(255,0,0)"]],
        zmin: 0,
        zmax: 100,
        coloraxis: "coloraxisSM",
        visible: metric === "tco",
        name: `Sobol-${metric}`,
        xaxis: "x2",
        yaxis: "y2"
    });

    // Monte Carlo (shared colorbar)
    heatmapData.push({
        z: zMonteCarlo[metric],
        x: xLabels,
        y: elasticityLabels,
        type: "heatmap",
        colorscale: [[0,"rgb(0,0,255)"], [0.5,"white"], [1,"rgb(255,0,0)"]],
        zmin: 0,
        zmax: 100,
        coloraxis: "coloraxisSM",
        visible: metric === "tco",
        name: `MC-${metric}`,
        xaxis: "x3",
        yaxis: "y3"
    });
});

// ---------- Layout ----------
const heatmapLayout = {
    grid: { rows: 1, columns: 3, pattern: "independent", xgap: 0.05 },
    height: 600,
    width: 1450,
    margin: { t: 80, l: 160, r: 160 }, // center plots

    yaxis: { showticklabels: true },
    yaxis2: { showticklabels: false },
    yaxis3: { showticklabels: false },

    // Elasticity colorbar
    coloraxis: {
        colorbar: {
            title: "Elasticity (%)",
            x: 1.12,
            xanchor: "left",
            len: 0.9,
            y: 0.5
        }
    },

    // Shared Sobol + Monte Carlo colorbar
    coloraxisSM: {
        cmin: 0,
        cmax: 100,
        colorscale: [[0,"rgb(0,0,255)"], [0.5,"white"], [1,"rgb(255,0,0)"]],
        colorbar: {
            title: "Sensitivity (%)", // give explicit title
            x: 1.28,                 // move slightly right
            xanchor: "left",
            len: 0.85,                // same as Elasticity
            y: 0.5
        }
    },

    annotations: [
        { text: "Elasticity", xref: "paper", yref: "paper", x: 0.16, y: 1.08, showarrow: false, font: { size: 14, weight: "bold" } },
        { text: "Sobol", xref: "paper", yref: "paper", x: 0.50, y: 1.08, showarrow: false, font: { size: 14, weight: "bold" } },
        { text: "Monte Carlo", xref: "paper", yref: "paper", x: 0.84, y: 1.08, showarrow: false, font: { size: 14, weight: "bold" } }
    ]
};


Plotly.newPlot("sensitivityHeatmaps", heatmapData, heatmapLayout);


// ---------- Tornado Charts (also in %) (with metric toggle) ----------
function getGPUVector(matrix, gpuIndex) {
  // matrix is [parameter][gpu]
  return matrix.map(row => row[gpuIndex]);
}
function renderTornadoPlots(metric) {
  const tornadoContainer = document.getElementById("gpuTornadoPlots");
  tornadoContainer.innerHTML = "";

  window.results.forEach((gpu, i) => {
    const gpuName = gpu.name;

    // ✅ RAW (not normalized)
    const elasticityVec = getGPUVector(allElasticities[metric], i);
    const sobolVec = sobolIndicesOptimized[metric][i];
    const mcVec = monteCarloParamResults[metric][i];

    const traceElasticity = {
      x: elasticityVec.map(Math.abs),
      y: elasticityLabels,
      name: "Elasticity (%)",
      type: "bar",
      orientation: "h"
    };

    const traceSobol = {
      x: sobolVec,
      y: elasticityLabels,
      name: "Sobol (%)",
      type: "bar",
      orientation: "h"
    };

    const traceMC = {
      x: mcVec,
      y: elasticityLabels,
      name: "Monte Carlo (%)",
      type: "bar",
      orientation: "h"
    };

    const layout = {
      title: `${gpuName} – ${metricTitles[metric]}`,
      barmode: "group",
      margin: { l: 200, r: 40, t: 50, b: 30 },
      height: 500,
      width: 600,
      xaxis: {
        title: "% Uncertainty Contribution",
        automargin: true,
        rangemode: "tozero"
      },
      yaxis: { automargin: true }
    };

    const chartDiv = document.createElement("div");
    chartDiv.id = `tornado-${metric}-${gpuName.replace(/\s+/g, '-')}`;
    tornadoContainer.appendChild(chartDiv);

    Plotly.newPlot(chartDiv, [traceElasticity, traceSobol, traceMC], layout);
  });
}
	
renderTornadoPlots("tco");

document
  .getElementById("tornadoMetricSelect")
  .addEventListener("change", e => {
    renderTornadoPlots(e.target.value);
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
    Work Per Total Cost of Ownership (TCO) calculation:

    Work-per-TCO = (Performance * system_usage * lifetime / 24) / (C_capital + C_operational)

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
  let tip = "💡 Adjusting values can help optimize your Work-per-TCO!";

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
      tip = "💡 Adjusting values can help optimize your Work-per-TCO!";
  }

  document.getElementById("ai-tip-text").innerText = tip;
}


document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('input[type="range"], input[type="number"], select').forEach(input => {
    input.addEventListener("input", updateAITip);
  });
});

// ===================== GENERATE BLOG POST (UPDATED) =====================
async function generateBlogPost() {
    // Check if the necessary sharing function exists
    if (typeof shareSetup !== 'function') {
        alert("Sharing functionality (shareSetup) is not available.");
        return;
    }

    const workload = document.getElementById('workload').value;
    const benchmarkId = document.getElementById('benchmarkId').value;
    const totalBudget = document.getElementById('total_budget').value;

    const bestGpu = window.bestResult?.name || "N/A";
    const bestPerfTCO = window.bestResult?.perf_per_tco?.toFixed(2) || "N/A";
    const tipText = document.getElementById("ai-tip-text")?.innerText || "No tips generated.";

    if (bestGpu === "N/A") {
        alert("Please run a calculation first before generating the blog post.");
        return;
    }

    // --- STEP 1: Generate Share Link ---
    document.getElementById("blogOutput").value = "Generating share link, please wait...";
    let shareUrl = 'https://wattlytics.netlify.app'; // Default URL

    try {
        const shareData = await shareSetup();
        if (shareData && shareData.url) {
            shareUrl = shareData.url;
        }
    } catch (e) {
        console.error("Failed to generate share link for blog post:", e);
        // Fallback to base URL if short link generation fails
    }

    // --- STEP 2: Generate Blog Content ---
    
    // Format the budget nicely
    const formattedBudget = parseInt(totalBudget).toLocaleString('en-US', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 });

    const blog = `## Optimizing Performance Per TCO for GPU Systems

In this analysis, we used the Wattlytics tool to evaluate GPU-based compute nodes for ${workload} workloads using Benchmark ID ${benchmarkId}.

### 🛠️ System Configuration
- Total Budget: ${formattedBudget}
- Benchmark: ${workload} (ID ${benchmarkId})
- Capital & Operational Costs: Customized using sliders.

### 📈 Results
The best GPU configuration found was:
- GPU: ${bestGpu}
- Work-per-TCO: ${bestPerfTCO} ns/€ * atom

### 🔗 Explore This Scenario
You can explore these exact configuration settings, including all custom costs and parameters, by clicking the link below:

[**Replicate this Scenario in Wattlytics**](${shareUrl})

This result can help inform purchasing and planning decisions for upcoming system acquisitions.

---
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
  doc.text("Work-per-TCO Report", 15, y);
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
    doc.text(`Work-per-TCO: ${best.perf_per_tco.toExponential(3)} ns/€ * atoms`, 15, y); y += lineHeight;
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
  doc.text("Generated using Wattlytics Calculator – © 2025 Ayesha Afzal <mailto:ayesha.afzal@fau.de>, NHR@HPC, FAU Erlangen-Nürnberg", 15, 285);

  // --- Save
  doc.save(`Wattlytics_Report_${now.replace(/[^\d]/g, "_")}.pdf`);
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
        <td>TCO (€) for ${result1.name}</td>
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
  <td><strong>Work-per-TCO (ns/€ * atoms) for ${result1.name}</strong></td>
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

/* --------------------
  Short-share feature (fixed)
  - encode/decode state
  - getCurrentState() to capture all sliders/selects/checkboxes/text inputs and GPU data
  - restoreState(state) to apply values and trigger calculateResults
  - shareSetup() to either encode into URL or POST to serverless saveConfig
  - On load: check ?d=... or /s/<id> and restore
---------------------*/

// ===================== STATE ENCODE / DECODE =====================
function encodeState(obj){
  try {
    const json = JSON.stringify(obj);
    if (typeof LZString !== "undefined" && LZString.compressToEncodedURIComponent) {
      return LZString.compressToEncodedURIComponent(json);
    } else {
      return encodeURIComponent(btoa(unescape(encodeURIComponent(json))));
    }
  } catch(e){
    console.error("encodeState error:", e);
    return null;
  }
}

function decodeState(str){
  try {
    if (typeof LZString !== "undefined" && LZString.decompressFromEncodedURIComponent) {
      return JSON.parse(LZString.decompressFromEncodedURIComponent(str));
    } else {
      const json = decodeURIComponent(escape(atob(decodeURIComponent(str))));
      return JSON.parse(json);
    }
  } catch(e){
    console.error("decodeState error:", e);
    return null;
  }
}

// ===================== GET & APPLY STATE =====================
function getCurrentState(){
  const state = {
    sliders: {},
    selects: {},
    checkboxes: {},
    texts: {},
    gpu_data: typeof GPU_data !== "undefined" ? GPU_data : null,
    active_gpu_data: typeof activeGPUData !== "undefined" ? activeGPUData : null,
    meta: {
      savedAt: (new Date()).toISOString(),
      origin: window.location.origin
    }
  };

  document.querySelectorAll('input[type="range"], input[type="number"]').forEach(input => {
    if (input.id) state.sliders[input.id] = Number(input.value);
  });

  document.querySelectorAll('select').forEach(s => {
    if (s.id) state.selects[s.id] = s.value;
  });

  document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    if (cb.id) state.checkboxes[cb.id] = cb.checked;
  });

  document.querySelectorAll('input[type="text"], input[type="email"]').forEach(inp => {
    if (inp.id) state.texts[inp.id] = inp.value;
  });

  return state;
}

// Define the map outside the function so it's only created once
const spanMap = {
    benchmarkId: "benchmarkVal",
    total_budget: "v_budget",
    C_node_server: "v_node_server",
    C_node_infra: "v_node_infra",
    C_node_facility: "v_node_facility",
    C_software: "v_software",
    C_electricity: "v_electricity",
    C_PUE: "v_PUE",
    C_maintenance: "v_maintenance",
    system_usage: "v_usage",
    lifetime: "v_lifetime",
    W_node_baseline: "v_baseline",
    C_depreciation: "v_depreciation",
    C_subscription: "v_subscription",
    C_uefficiency: "v_uefficiency",
    C_heatreuseperkWh: "v_heatreuseperkWh",
    Factor_heatreuse: "v_Factor_heatreuse"
};

function applyInputsFromState(state){
    if(!state) return;

    // --- Sliders (Updated with the fix) ---
    Object.entries(state.sliders || {}).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (!el) return;
        
        el.value = val;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        
        // **CRITICAL FIX: Update the display span**
        const spanId = spanMap[id];
        if (spanId && typeof updateValue === "function") {
             updateValue(spanId, val); 
        }
    });

    // --- Texts (Copied from Part A) ---
    Object.entries(state.texts || {}).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.value = val;
        el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    
    // --- Selects (Copied from Part A) ---
    Object.entries(state.selects || {}).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.value = val;
        el.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // --- Checkboxes (Copied from Part A) ---
    Object.entries(state.checkboxes || {}).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.checked = Boolean(val);
        el.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // --- Restore GPU data (Copied from Part A) ---
    if (state.gpu_data) {
        try { window.GPU_data = JSON.parse(JSON.stringify(state.gpu_data)); }
        catch(e){ console.warn("Unable to restore GPU_data:", e); }
    }
    if (state.active_gpu_data) {
        try { window.activeGPUData = JSON.parse(JSON.stringify(state.active_gpu_data)); }
        catch(e){ console.warn("Unable to restore activeGPUData:", e); }
    }
}

// ===================== HELPER: waitFor =====================
function waitFor(conditionFn, timeout = 5000, interval = 50) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    (function check() {
      if (conditionFn()) return resolve(true);
      if (Date.now() - start > timeout) return reject("waitFor timeout");
      setTimeout(check, interval);
    })();
  });
}

// ===================== RESTORE STATE =====================
async function restoreStateWhenReady(state){
    if (!state) return;

    try {
        // Wait until sliders exist AND GPU_data is ready AND at least one calculation function exists
        await waitFor(() => {
            const sliderExists = document.querySelector('input[type="range"]');
            
            // **REFINEMENT HERE:** Check if GPU_data is an Array AND has elements
            const gpuDataReady = Array.isArray(window.GPU_data) && window.GPU_data.length > 0;
            
            const calcReady = typeof calculateResults === "function" || typeof calculate === "function" || typeof runAllCalculations === "function";
            
            // Note the use of gpuDataReady in the return condition
            return sliderExists && gpuDataReady && calcReady; 
        }, 7000); // 7s timeout

        // ... (rest of the function remains the same: applyInputsFromState, etc.)
        
        applyInputsFromState(state);

        // Extra delay for async plot/table rendering
        await new Promise(r => setTimeout(r, 200));

        // Trigger calculation
        if (typeof calculateResults === "function") calculateResults();
        else if (typeof calculate === "function") calculate();
        else if (typeof runAllCalculations === "function") runAllCalculations();
        else {
            const calcBtn = document.getElementById('calculate') || document.getElementById('run-calc');
            if (calcBtn) calcBtn.click();
        }

        console.log("✅ State restored successfully.");

    } catch(e){
        console.warn("restoreStateWhenReady() failed:", e);
    }
}

// ===================== HELPER: COPY TO CLIPBOARD =====================
/**
 * Attempts to copy text to the clipboard and offers to open the link in a new tab.
 * @param {string} text - The text (URL) to copy.
 * @param {string} successMsg - Message to display on successful copy.
 */
async function copyToClipboard(text, successMsg = "Copied link to clipboard.") {
    try {
        await navigator.clipboard.writeText(text);
        
        // --- UX IMPROVEMENT: Use confirm() to offer the New Tab option ---
        const userChoice = confirm(
            successMsg + "\n\nWould you like to open this link in a new tab now?"
        );
        
        if (userChoice) {
            // User clicked 'OK' (or similar button)
            window.open(text, '_blank');
        }
        // If the user clicks 'Cancel' (or similar button), they proceed to share the copied link.
        
        return true;
    } catch (err) {
        console.warn("Clipboard write failed (Security error or no permission):", err);
        
        // --- Fallback Mechanism (for security failure) ---
        prompt(
            "Automatic clipboard access failed due to browser security. Please copy the link manually from this box:", 
            text
        );
        return false;
    }
}

// ===================== SHARE LINK =====================
async function shareSetup() {
    try {
        const state = getCurrentState();
        const encoded = encodeState(state);
        if (!encoded) throw new Error("Failed to encode state.");

        const urlIfEmbedded = `${window.location.origin}${window.location.pathname}?d=${encoded}`;
        
        // --- Embedded Link Logic ---
        if (urlIfEmbedded.length <= 2000 && encoded.length < 1200) {
            await copyToClipboard(urlIfEmbedded, "Copied shareable link (embedded) to clipboard.");
            return { mode: "embedded", url: urlIfEmbedded };
        }

        // --- Short Link Fallback Logic ---
        const res = await fetch('/.netlify/functions/saveConfig', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ config: state })
        });

        if (!res.ok) throw new Error(`Save failed: ${res.status} ${await res.text()}`);

        const data = await res.json();
        const id = data.id || data.ID || data.key;
        if (!id) throw new Error("No id returned from backend.");

        const shortUrl = `${window.location.origin}/s/${id}`;
        
        // Use the robust copyToClipboard function
        await copyToClipboard(shortUrl, "Copied shareable short link to clipboard.");

        return { mode: "short", id, url: shortUrl };

    } catch (e) {
        console.error("shareSetup error:", e);
        alert("Could not create share link: " + e.message);
        return null;
    }
}

// ===================== RESTORE FROM URL =====================
async function tryRestoreFromUrlOnLoad() {
  const path = window.location.pathname;
  const params = new URLSearchParams(window.location.search);
  let state = null;

  // Case 1: /s/<id>
  if (path.startsWith("/s/")) {
    const id = path.replace("/s/", "").trim();
    if (id) {
      try {
        const res = await fetch(`/.netlify/functions/getConfig?id=${id}`);
        if (res.ok) {
          const json = await res.json();
          if (json?.data) state = json.data;
        }
      } catch (err) {
        console.error("Error fetching shared config:", err);
      }
    }
  }

  // Case 2: ?d=<compressed>
  if (!state && params.has("d")) {
    try {
      state = decodeState(params.get("d"));
    } catch (err) {
      console.error("Error decoding state from URL:", err);
    }
  }

  if (state) {
    await restoreStateWhenReady(state);
    console.log("✅ State restored and calculations triggered from URL.");
    return true;
  }

  return false;
}

// ===================== DOMContentLoaded LISTENER =====================
document.addEventListener("DOMContentLoaded", () => {
  // Setup Share button
  const shareBtn = document.getElementById("shareBtn");
  if (shareBtn) shareBtn.addEventListener("click", shareSetup);

  // Restore state from URL if possible
  tryRestoreFromUrlOnLoad().then(restored => {
    if (restored) {
      console.log("✅ URL state applied.");
    } else {
      console.log("ℹ️ No URL state found; running default initialization.");

      // --- DEFAULT INITIALIZATION ---
      if (typeof loadStaticGPUPrices === "function") loadStaticGPUPrices();
      if (typeof calculate === "function") calculate();
      if (typeof runAllCalculations === "function") runAllCalculations();
      // Add any other default setup here
    }
  }).catch(err => {
    console.error("Error during URL restoration:", err);
    // fallback to defaults
    if (typeof loadStaticGPUPrices === "function") loadStaticGPUPrices();
    if (typeof calculate === "function") calculate();
  });
});

// ---- Expose functions to HTML (ES module fix) ----
window.toggleGPUFreqSlider = toggleGPUFreqSlider;
window.toggleGPUPowerSlider = toggleGPUPowerSlider;
window.updateValue = updateValue;
window.calculate = calculate;
window.updateAITip = updateAITip;
window.resetForm = resetForm;
window.exportGPUDataJSON = exportGPUDataJSON;
window.exportGPUDataCSV = exportGPUDataCSV;
window.handleMainGPUUpload = handleMainGPUUpload;
window.promptPassword = promptPassword;
window.validatePassword = validatePassword;
window.saveScenario = saveScenario;
window.compareScenarios = compareScenarios;
window.downloadComparisonPDF = downloadComparisonPDF;
window.renderPerfPowerHeatmaps = renderPerfPowerHeatmaps;
window.generatePDFReport = generatePDFReport;
window.generateBlogPost = generateBlogPost;
