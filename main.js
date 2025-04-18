
function updateValue(spanId, val) {
    document.getElementById(spanId).innerText = val;
}

function calculate() {
    const workload = document.getElementById("workload").value;
    const budget = parseFloat(document.getElementById("totalBudget").value);
    const usage = parseFloat(document.getElementById("systemUsage").value);

    const dummyPerf = Math.random() * 10;  // Placeholder logic

    document.getElementById("results").innerHTML =
        `<p><strong>${workload}</strong> workload: Estimated Perf/TCO is <strong>${dummyPerf.toFixed(2)}</strong></p>`;

    const ctx = document.getElementById("barChart").getContext("2d");
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['GPU1', 'GPU2', 'GPU3'],
            datasets: [{
                label: 'Performance per TCO',
                data: [dummyPerf, dummyPerf * 0.8, dummyPerf * 0.6],
                backgroundColor: ['#4e79a7', '#f28e2c', '#e15759']
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function showFormula() {
    const formulaText = `
        Performance / TCO = Performance / (C_capital + C_operational)
        
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
                  + C_uefficiency`;
    alert(formulaText);
}
