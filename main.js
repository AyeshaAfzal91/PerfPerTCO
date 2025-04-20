/*!
 * Author: Ayesha Afzal <ayesha.afzal@fau.de>
 * © 2025 NHR@HPC, FAU Erlangen-Nuremberg. All rights reserved.
 */


const GPU_data = [
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


function updateValue(spanId, val) {
  document.getElementById(spanId).innerText = val;
}
function getSliderValue(id) {
  return parseFloat(document.getElementById(id).value);
}

function calculate() {
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

let baseline_perf_tco = 0;
const results = [];
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
  results.push({
    name: gpu.name,
    n_gpu,
    total_cost: used_budget,
    perf_per_tco,
    baseline_pct,
    capital,
    operational,
    capital_components: [cap_gpu, cap_server, cap_infra, cap_facility, cap_baseline],
    operational_components: [energyandcooling, maintenance, op_baseline],
    originalGPUIndex: i  // Adding the original index
  });

  capital_components.push([cap_gpu, cap_server, cap_infra, cap_facility, cap_baseline]);
  operational_components.push([energyandcooling, maintenance, op_baseline]);

  console.log(`GPU: ${gpu.name}, Total Cost: ${used_budget}, Perf/TCO: ${perf_per_tco}`);
});



// After loop, check if any valid GPU was found
if (baseline_perf_tco === 0 && results.length > 0) {
  baseline_perf_tco = results[0].perf_per_tco;
} else if (results.length === 0) {
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
results.sort((a, b) => b.perf_per_tco - a.perf_per_tco);

// Filter out GPUs with zero Performance per TCO
const nonzeroResults = results.filter(r => r.perf_per_tco > 0);

// Check if nonzeroResults is empty before calculating performance ratio
if (nonzeroResults.length === 0) {
  document.getElementById("comparison-message-container").innerHTML = '<p>No valid GPUs found.</p>';
  return;
}

// Find max and min among valid entries
const maxResult = nonzeroResults[0]; // Best GPU by Performance per TCO
const minResult = nonzeroResults[nonzeroResults.length - 1]; // Worst GPU by Performance per TCO

// Compute performance ratio
const performanceRatio = maxResult.perf_per_tco / minResult.perf_per_tco;

// Now let's append the comparison message to the screen below the table.
const comparisonMessageContainer = document.getElementById("comparison-message-container");

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
  downloadCSV2(results);
});

// Optional debug print
console.table(results.map(r => ({
  GPU: r.name,
  '#GPUs': r.n_gpu,
  'Total TCO (€)': `€${Math.round(r.total_cost).toLocaleString()}`,
  'Perf/TCO (ns/day/€ * atoms)': r.perf_per_tco.toFixed(1),
  'Baseline %': r.baseline_pct.toFixed(2)
})));

// Find the maximum values for each column to use in heatmap color calculation
const maxTotalCost = Math.max(...results.map(r => r.total_cost));
const maxPerfPerTCO = Math.max(...results.map(r => r.perf_per_tco));
const maxBaselinePct = Math.max(...results.map(r => r.baseline_pct));
const maxGPUs = Math.max(...results.map(r => r.n_gpu)); // Find the max number of GPUs

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
      ${results.map(r => `
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
    orientation: 'v',
    x: 1.02,
    y: 1
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
downloadButtonDiv.innerHTML = `<button id="download-btn">Download TCO Breakdown Chart (High Resolution)</button>`;
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

// Add the chart title if it doesn't exist already
if (!document.getElementById('chart-title')) {
  const chartTitleDiv = document.createElement('div');
  chartTitleDiv.id = 'chart-title';  // Give it an ID to avoid duplication
  chartTitleDiv.classList.add('chart-title');
  chartTitleDiv.innerHTML = 'TCO Breakdown (Capital vs Operational costs)';
  document.getElementById('stacked-tco-chart').parentElement.insertBefore(chartTitleDiv, document.getElementById('stacked-tco-chart'));
}


// ---------- Parameter Sensitivities Analysis ----------
const elasticityLabels = [
  'GPU (€)', 'Node Server (€)', 'Node Infrastructure (€)', 'Node Facility (€)', 'Software (€)',
  'Electricity (€/kWh)', 'Heat Reuse Revenue (€/kWh)', 'PUE', 'Node Maintenance (€/year)', 'System Usage (hrs/year)', 
  'System Lifetime (years)',  'Node Baseline Power w/o GPUs (W)',  
  'Depreciation cost', 'Software Subscription (€/year)', 'Utilization Inefficiency (€/year)'
];

const elasticities = results.map((r, i) => {
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
  const gpuName = results[i].name;

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
  x: results.map(r => r.name),
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
    tableHTML += `<tr><td>${results[i].name}</td>`;
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
    tableHTML += `<tr><td>${results[i].name}</td>`;
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
    results[i].name,
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

const footer = document.createElement('div');
footer.style.marginTop = "40px";
footer.style.padding = "12px 0";
footer.style.fontSize = "13px";
footer.style.textAlign = "center";
footer.style.color = "#666";
footer.innerHTML = `&copy; 2025, Author: Ayesha Afzal &lt;<a href="mailto:ayesha.afzal@fau.de">ayesha.afzal@fau.de</a>&gt;, NHR@HPC, FAU Erlangen-Nürnberg.`;

document.body.appendChild(footer);


