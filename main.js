
function calculate() {
    document.getElementById('output').innerHTML = '<p><strong>Calculation logic goes here...</strong></p>';
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
