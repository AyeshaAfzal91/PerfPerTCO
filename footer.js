/*!
 * Author: Ayesha Afzal <ayesha.afzal@fau.de>
 * © 2025 NHR@HPC, FAU Erlangen-Nuremberg. All rights reserved.
 */

// Get today's date in the format "Month Day, Year"
const todaysDate = new Date().toLocaleDateString('en-US', { 
  year: 'numeric', month: 'long', day: 'numeric' 
});

const footer = document.createElement('div');
footer.style.marginTop = "40px";
footer.style.padding = "12px 20px";
footer.style.fontSize = "13px";
footer.style.textAlign = "center";
footer.style.color = "#666";
footer.style.backgroundColor = "#f9f9f9";
footer.style.borderTop = "1px solid #ddd";

// Create BibTeX download link (if needed)
const bibtexContent = `
@misc{Afzal2025Wattlytics,
  author       = {Ayesha Afzal},
  title        = {Wattlytics: Analytics for Smarter Energy Decisions},
  year         = {2025},
  howpublished = {\\url{https://wattlytics.netlify.app}},
  note         = {Accessed: ${todaysDate}. Licensed under CC BY 4.0.}
}
`;

const blob = new Blob([bibtexContent.trim()], { type: 'text/plain' });
const bibLink = document.createElement('a');
bibLink.href = URL.createObjectURL(blob);
bibLink.download = 'PerformancePerTCO.bib';
bibLink.textContent = 'Download BibTeX';
bibLink.style.display = 'inline-block';
bibLink.style.marginTop = '5px';
bibLink.style.color = '#3366cc';
bibLink.style.textDecoration = 'none';

// Update footer content
footer.innerHTML = `
  &copy; 2025, Author: Ayesha Afzal &lt;<a href="mailto:ayesha.afzal@fau.de">ayesha.afzal@fau.de</a>&gt;, 
  NHR@HPC, FAU Erlangen-Nürnberg.<br><br>
  This website and its content are licensed under 
  <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a> and require citation when used.<br><br>
  <strong>Please cite this tool as</strong><br>
  <em>Ayesha Afzal (2025). Wattlytics: Analytics for Smarter Energy Decisions. 
  <a href="https://perfpertco.netlify.app" target="_blank">https://wattlytics.netlify.app</a> 
  Accessed: ${todaysDate}. Licensed under CC BY 4.0.</em><br>
`;

footer.appendChild(bibLink);
document.body.appendChild(footer);

