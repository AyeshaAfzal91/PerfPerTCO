
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
    alert(`Performance / TCO = Performance / (Capital Cost + Operational Cost)`);
}
