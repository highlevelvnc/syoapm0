const BASE = "https://syoapm0.vercel.app";

const GRADE_COLORS = {
  "A+": "#10b981",
  A: "#10b981",
  B: "#34d399",
  C: "#f59e0b",
  D: "#f97316",
  F: "#ef4444",
};

function setDomain(text) {
  document.getElementById("domain").textContent = text;
}

function showLoading(msg) {
  const area = document.getElementById("score-area");
  area.innerHTML = `<div class="loading">${msg}</div>`;
}

function showNoScore() {
  document.getElementById("score-area").innerHTML =
    '<div class="loading" style="animation:none">click below to scan now</div>';
}

function showScore(scan, cached) {
  const grade = scan.grade || "?";
  const score = scan.score != null ? scan.score : "—";
  const color = GRADE_COLORS[grade] || "#4a5462";
  const area = document.getElementById("score-area");
  area.innerHTML = `
    <div class="score-row">
      <span class="score-num" style="color:${color}">${score}</span>
      <span class="score-grade" style="color:${color}">${grade}</span>
    </div>
    <div class="score-meta">
      ${scan.critical_findings || 0} crit · ${scan.high_findings || 0} high · ${scan.total_findings || 0} total${cached ? " · cached" : ""}
    </div>
  `;
}

async function fetchScore(domain) {
  try {
    const res = await fetch(`${BASE}/api/public/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain }),
    });
    const data = await res.json();
    if (res.status === 429) {
      document.getElementById("score-area").innerHTML =
        '<div class="loading" style="animation:none;color:#f59e0b">rate limit · try later</div>';
      return;
    }
    if (!res.ok || !data.scan) {
      showNoScore();
      return;
    }
    showScore(data.scan, data.cached);
  } catch (err) {
    showNoScore();
  }
}

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.url) {
    setDomain("—");
    showNoScore();
    return;
  }

  let domain;
  try {
    const url = new URL(tab.url);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      setDomain(url.protocol);
      showNoScore();
      return;
    }
    domain = url.hostname.replace(/^www\./, "");
  } catch (e) {
    setDomain("—");
    showNoScore();
    return;
  }

  setDomain(domain);

  document.getElementById("scan-btn").addEventListener("click", () => {
    chrome.tabs.create({ url: `${BASE}/test/${encodeURIComponent(domain)}` });
    window.close();
  });

  showLoading("a verificar cache");
  fetchScore(domain);
}

document.getElementById("dashboard-btn").addEventListener("click", () => {
  chrome.tabs.create({ url: `${BASE}/dashboard` });
  window.close();
});

init();
