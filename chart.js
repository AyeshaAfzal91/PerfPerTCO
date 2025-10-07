new Chart(document.getElementById("priceChart"), {
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
        text: 'Live GPU Prices Over Time (€)'
      },
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true
        },
        onClick: (e, legendItem, legend) => {
          // toggle visibility of lines
          const index = legendItem.datasetIndex;
          const chart = legend.chart;
          const meta = chart.getDatasetMeta(index);
          meta.hidden = meta.hidden === null ? !chart.data.datasets[index].hidden : null;
          chart.update();
        }
      },
      tooltip: {
        callbacks: {
          label: context => `€ ${context.parsed.y.toFixed(2)}`
        }
      }
    },
    scales: {
      y: {
        title: { display: true, text: "Price (€)" },
        beginAtZero: false
      },
      x: {
        title: { display: true, text: "Date" },
        ticks: {
          maxTicksLimit: 10
        }
      }
    },
    elements: {
      line: {
        tension: 0.3 // smooth curves
      },
      point: {
        radius: 4
      }
    }
  }
});
