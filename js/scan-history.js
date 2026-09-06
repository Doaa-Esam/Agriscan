async function loadScanHistory() {
try {
const response = await fetch("http://localhost:3000/api/scans");
const scans = await response.json();
const totalScans = document.getElementById("totalScans");
const goodScans = document.getElementById("goodScans");

totalScans.textContent = scans.length;

const goodCount = scans.filter(scan => scan.status === "NORMAL").length;
goodScans.textContent = goodCount;

const historySections = document.querySelectorAll(".history-section");
historySections.forEach(section => section.remove());

const container = document.querySelector(".history-container");
const newScanButton = document.getElementById("historyNewScan");

const section = document.createElement("div");
section.className = "history-section";

const title = document.createElement("div");
title.className = "history-section-title";
title.innerHTML = '<span>نتائج الفحوصات</span><i class="fa-regular fa-calendar"></i>';

section.appendChild(title);

scans.forEach(scan => {
const card = document.createElement("div");
card.className = "history-card";

let statusText;
let statusClass;
let icon;

if (scan.status === "NORMAL") {
statusText = "حالة التربة: طبيعية";
statusClass = "good";
icon = "fa-seedling";
} else if (scan.status === "DRY") {
statusText = "التربة جافة";
statusClass = "warning";
icon = "fa-triangle-exclamation";
} else {
statusText = "التربة رطبة جدًا";
statusClass = "warning";
icon = "fa-triangle-exclamation";
}

const date = new Date(scan.created_at);

card.innerHTML = `
<div class="history-card-icon ${statusClass}">
<i class="fa-solid ${icon}"></i>
</div>
<div class="history-card-content">
<h3>فحص التربة #${scan.id}</h3>
<span class="history-status ${statusClass}-text">${statusText}</span>
<p>الرطوبة ${scan.moisture}% • درجة الحرارة ${scan.temperature}°C</p>
<small>
<i class="fa-regular fa-clock"></i>
${date.toLocaleString("ar-EG")}
</small>
</div>
<button class="history-view-btn" type="button">
<i class="fa-solid fa-chevron-right"></i>
</button>
`;

section.appendChild(card);
});

container.insertBefore(section, newScanButton);

} catch (error) {
console.error("Error loading scan history:", error);
}
}

loadScanHistory();