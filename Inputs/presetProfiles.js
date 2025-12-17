export const presetProfiles = {
  Alex: { // (44 A40-40GB + 20 A100-40GB + 18 A100-80GB) nodes; 8 x (44 + 20 + 18) GPUs
    name: "NHR@FAU Alex Cluster (A100, A40)",
    sliders: {
      total_budget: 10000000,		  // (example estimate)
      C_node_server: 60000,           // A100 node: (40k€ for <50% of A100) / 53k€ / 73k€ / 78k€ (depending on the time without tax, network costs and cooling infrastructure, etc.). Let's take a mid-range value: €60k per A100 node.
      C_node_infrastructure: 15000,   // CDU + piping = €1.5 million per 100 nodes → €15k per node (significant infrastructure cost especially for warm water cooling)
      C_node_facility: 0,             // Housing/floor space costs nothing for us as its a very old building
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
      C_node_facility: 0,             // Housing/floor space costs nothing for us as its a very old building
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
