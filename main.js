const GPU_data = [
  {
    name: "H100",
    cost: 25818 * 1.19,
    perf: { GROMACS: 34908616.88, AMBER: 87373738.6 },
    power: { GROMACS: 400.5, AMBER: 468.57 },
    per_node: 4
  },
  {
    name: "GH200",
    cost: 25000 * 1.19,
    perf: { GROMACS: 39618475.84, AMBER: 0 },
    power: { GROMACS: 412.7, AMBER: 0 },
    per_node: 4
  },
  {
    name: "A100",
    cost: 7264 * 1.19,
    perf: { GROMACS: 21986097.84, AMBER: 53568169 },
    power: { GROMACS: 264.7, AMBER: 303.63 },
    per_node: 8
  },
  {
    name: "A40",
    cost: 4275 * 1.19,
    perf: { GROMACS: 20825707.68, AMBER: 35779695.35 },
    power: { GROMACS: 297.0, AMBER: 289.73 },
    per_node: 8
  },
  {
    name: "L4",
    cost: 2200 * 1.19,
    perf: { GROMACS: 13243231.6, AMBER: 20680301.1 },
    power: { GROMACS: 71.9, AMBER: 71.76 },
    per_node: 4
  },
  {
    name: "L40",
    cost: 6024 * 1.19,
    perf: { GROMACS: 36117718.56, AMBER: 60002751.85 },
    power: { GROMACS: 301.3, AMBER: 293.14 },
    per_node: 8
  },
  {
    name: "L40S",
    cost: 6100 * 1.19,
    perf: { GROMACS: 39030190.56, AMBER: 70759069.45 },
    power: { GROMACS: 313.8, AMBER: 318.4 },
    per_node: 8
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

  const C_node_server = getSliderValue("C_node_server");
  const C_node_infra = getSliderValue("C_node_infra");
  const C_node_facility = getSliderValue("C_node_facility");
  const C_software = getSliderValue("C_software");
  const C_electricity = getSliderValue("C_electricity");
  const C_cooling = getSliderValue("C_cooling");
  const C_maintenance = getSliderValue("C_maintenance");
  const system_usage = getSliderValue("system_usage");
  const lifetime = getSliderValue("lifetime");
  const W_node_baseline = getSliderValue("W_node_baseline");

  const C_depreciation = getSliderValue("C_depreciation");
  const C_subscription = getSliderValue("C_subscription");
  const C_uefficiency = getSliderValue("C_uefficiency");
  const C_heatreuseperkWh = getSliderValue("C_heatreuseperkWh");
  const total_budget = getSliderValue("total_budget");

let baseline_perf_tco = 0;
const results = [];
const capital_components = [];
const operational_components = [];

let min_valid_n_gpu = Infinity;

// ---------- Compute n_gpu ----------
const n_gpu_list = GPU_data.map(gpu => {
  const perf = gpu.perf[workload];
  const power = gpu.power[workload];
  if (perf === 0 || power === 0) return 0;

  const per_node = gpu.per_node;

  const W_gpu_total = power * system_usage * lifetime;
  const W_node_baseline_total = W_node_baseline * system_usage * lifetime;

  const A =
    gpu.cost +
    ((C_electricity - C_heatreuseperkWh) * W_gpu_total / 1000) +
    (C_cooling * W_gpu_total / 1000) +
    (
      C_node_server +
      C_node_infra +
      C_node_facility +
      (C_maintenance * lifetime) +
      (C_cooling * W_node_baseline_total / 1000)
    ) / per_node;

  const C_baseline = C_software + (lifetime * (C_depreciation + C_subscription + C_uefficiency));
  const B = total_budget - C_baseline;

  let n_gpu = Math.floor(B / A);
  n_gpu = Math.floor(n_gpu / per_node) * per_node;

  if (n_gpu < per_node) {
    console.warn(`${gpu.name} cannot be deployed with the current budget.`);
    return 0;
  }

  if (same_n_gpu) {
    min_valid_n_gpu = Math.min(min_valid_n_gpu, n_gpu);
  }

  return n_gpu;
});

// ---------- Compute cost breakdowns ----------
GPU_data.forEach((gpu, i) => {
  const perf = gpu.perf[workload];
  const power = gpu.power[workload];
  if (workload === 'GROMACS' && Object.keys(gpu.perf).length > 7) {
    alert("Error: There are only 6 GROMACS benchmark sets available.");
    return 0;  // Return 0 to prevent further processing for this GPU
  }
  if (perf === 0 || power === 0) return;

  let n_gpu = n_gpu_list[i];
  if (n_gpu === 0) return;

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
  const energy = (C_electricity - C_heatreuseperkWh) * W_gpu_total * n_gpu / 1000;
  const cooling = C_cooling * ((W_node_baseline_total * n_nodes) + (W_gpu_total * n_gpu)) / 1000;
  const maintenance = lifetime * C_maintenance * n_nodes;
  const op_baseline = lifetime * (C_depreciation + C_subscription + C_uefficiency);

  // --- Totals ---
  const capital = cap_gpu + cap_server + cap_infra + cap_facility + cap_baseline;
  const operational = energy + cooling + maintenance + op_baseline;
  const used_budget = capital + operational;

  const baseline_pct = 100 * (cap_baseline + op_baseline) / used_budget;
  const total_perf = perf * n_gpu;
  const perf_per_tco = total_perf / used_budget;

  if (baseline_perf_tco === 0) baseline_perf_tco = perf_per_tco;

  results.push({
    name: gpu.name,
    n_gpu,
    total_cost: used_budget,
    perf_per_tco,
    baseline_pct,
    capital,
    operational,
    capital_components: [cap_gpu, cap_server, cap_infra, cap_facility, cap_baseline],
    operational_components: [energy, cooling, maintenance, op_baseline]
  });

  capital_components.push([cap_gpu, cap_server, cap_infra, cap_facility, cap_baseline]);
  operational_components.push([energy, cooling, maintenance, op_baseline]);
});

// ---------- Print HTML table and message ----------

  // Sort the results by Performance per TCO
  results.sort((a, b) => b.perf_per_tco - a.perf_per_tco);

  // Filter out GPUs with zero Performance per TCO
  const nonzeroResults = results.filter(r => r.perf_per_tco > 0);

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

  const maxTotalCost = Math.max(...results.map(r => Math.abs(r.total_cost)));
  const maxPerfPerTCO = Math.max(...results.map(r => Math.abs(r.perf_per_tco)));
  const maxBaselinePct = Math.max(...results.map(r => Math.abs(r.baseline_pct)));
  const maxGPUs = Math.max(...results.map(r => r.n_gpu)); // Find the max number of GPUs

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

const chartContainer = document.getElementById('gpu-chart').parentElement;
if (!document.getElementById('chart-title-perf-tco')) {
  const chartTitleDiv = document.createElement('div');
  chartTitleDiv.id = 'chart-title-perf-tco';
  chartTitleDiv.classList.add('chart-title');
  chartTitleDiv.innerHTML = 'Performance per TCO and GPU Count by GPU Type';
  chartContainer.insertBefore(chartTitleDiv, document.getElementById('gpu-chart'));
}

// ---------- Plotly Stacked TCO Char ----------
// Prepare the data for the TCO Breakdown
const tcoLabels = nonzeroResults.map(r => r.name);

// Define component labels
const capLabels = ['GPU', 'Server', 'Infra', 'Facility', 'Software'];
const opLabels = ['Energy', 'Cooling', 'Maintenance', 'Baseline OPEX'];

// Build data arrays for each component type
const capBreakdown = capLabels.map((_, idx) =>
  nonzeroResults.map(r => r.capital_components[idx])
);
const opBreakdown = opLabels.map((_, idx) =>
  nonzeroResults.map(r => r.operational_components[idx])
);

// Colors matching your Chart.js style
const plotlyColors = [
  'rgba(102,204,102,0.7)',   // GPU Cost
  'rgba(255,77,77,0.7)',     // Server Cost
  'rgba(102,255,255,0.7)',   // Infra Cost
  'rgba(255,128,179,0.7)',   // Facility Cost
  'rgba(255,204,128,0.7)',   // Baseline Capital Cost
  'rgba(128,77,255,0.7)',    // Energy Cost
  'rgba(204,102,179,0.7)',   // Cooling Cost
  'rgba(179,128,255,0.7)',   // Maintenance Cost
  'rgba(102,153,255,0.7)'    // Baseline Op Cost
];

const capTraces = capLabels.map((label, i) => ({
  x: tcoLabels,
  y: capBreakdown[i],
  name: `[Capital] ${label}`,
  type: 'bar',
  marker: { color: plotlyColors[i] }
}));

const opTraces = opLabels.map((label, i) => ({
  x: tcoLabels,
  y: opBreakdown[i],
  name: `[Operational] ${label}`,
  type: 'bar',
  marker: { color: plotlyColors[i + capLabels.length] }
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
  }
};

Plotly.newPlot('stacked-tco-chart', [...capTraces, ...opTraces], tcoLayout, { displayModeBar: true });

if (!document.getElementById('chart-title')) {
  const chartTitleDiv = document.createElement('div');
  chartTitleDiv.id = 'chart-title';  // Give it an ID to avoid duplication
  chartTitleDiv.classList.add('chart-title');
  chartTitleDiv.innerHTML = 'TCO Breakdown (Capital vs Operational costs)';
  document.getElementById('stacked-tco-chart').parentElement.insertBefore(chartTitleDiv, document.getElementById('stacked-tco-chart'));
}


// ---------- Parameter Sensitivities Analysis ----------
const elasticityLabels = [
  'GPU cost', 'Server cost', 'Infrastructure cost', 'Facility cost', 'Software cost',
  'Electricity cost', 'Heat reuse cost', 'Cooling cost', 'Maintenance cost',
  'Depreciation cost', 'Subscription cost', 'Uefficiency cost'
];

const elasticities = results.map((r, i) => {
  const n_gpu = r.n_gpu;
  const n_nodes = n_gpu / GPU_data[i].per_node;
  const W_gpu = GPU_data[i].power[workload];
  const W_gpu_total = W_gpu * system_usage * lifetime;
  const W_node_total = W_node_baseline * system_usage * lifetime;

  const vals = [
    n_gpu, // GPU cost
    n_nodes, // Server cost
    n_nodes, // Infra cost
    n_nodes, // Facility cost
    1, // Software cost
    (W_gpu_total * n_gpu) / 1000, // Electricity
    -(W_gpu_total * n_gpu) / 1000, // Heat reuse
    ((W_node_total * n_nodes + W_gpu_total * n_gpu) / 1000), // Cooling
    n_nodes * lifetime, // Maintenance
    lifetime, // Depreciation
    lifetime, // Subscription
    lifetime // Uefficiency
  ];

  const baseValues = [
    GPU_data[i].cost,
    C_node_server,
    C_node_infra,
    C_node_facility,
    C_software,
    C_electricity,
    C_heatreuseperkWh,
    C_cooling,
    C_maintenance,
    C_depreciation,
    C_subscription,
    C_uefficiency
  ];

  return vals.map((v, idx) => (v * baseValues[idx]) / r.total_cost);
});



// ---------- Plotly Tornado Chart ----------
const tornadoContainer = document.getElementById("gpuTornadoPlots");
tornadoContainer.innerHTML = ""; // Clear previous charts

// Add a main title above the charts
const mainTitle = document.createElement("h2");
mainTitle.textContent = "GPU Cost Parameters Sensitivity Analysis";  // Main title for all charts
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
      title: "Normalized Sensitivity",
      zeroline: true,
      zerolinewidth: 1,
      zerolinecolor: "#000"
    },
    yaxis: {
      automargin: true,
      title: ""
    },
    margin: { l: 160, r: 20, t: 30, b: 30 },
    height: 250,
    width: 350,
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
  xaxis: { title: 'GPU' },
  yaxis: { title: 'Cost Parameter', automargin: true },
  margin: { t: 60, l: 150 }
});

const chartTitleDiv = document.createElement('div');
chartTitleDiv.classList.add('chart-title');
chartTitleDiv.innerHTML = 'Heatmap: Sensitivity of Cost Parameters across GPUs';
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

  let tableHTML = "<h3>Capital Cost Elasticities</h3>";
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

  tableHTML += `<hr><h3>Operational Cost Elasticities</h3>`;
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
                  (C_electricityperkWh - C_heatreuseperkWh) * W_gpu * systemusage / 1000
                 + C_coolingperkWh * (W_node_baseline * systemusage / GPUs_per_node + W_gpu * systemusage) / 1000
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




