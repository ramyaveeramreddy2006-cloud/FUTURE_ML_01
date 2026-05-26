const API_URL = "http://127.0.0.1:5000";

const form = document.getElementById("forecastForm");
const forecastUnits = document.getElementById("forecastUnits");
const modelError = document.getElementById("modelError");
const forecastBar = document.getElementById("forecastBar");
const businessInsight = document.getElementById("businessInsight");
const apiStatus = document.getElementById("apiStatus");
const heroForecast = document.getElementById("heroForecast");
const heroError = document.getElementById("heroError");
const datasetRows = document.getElementById("datasetRows");
const chart = document.getElementById("chart");

let chartRows = [
  { month: "2026-01", units_sold: 1580 },
  { month: "2026-02", units_sold: 1640 },
  { month: "2026-03", units_sold: 1810 },
  { month: "2026-04", units_sold: 2020 },
  { month: "2026-05", units_sold: 2240 },
  { month: "Forecast", units_sold: 2205, forecast: true }
];

function getFormData() {
  const data = new FormData(form);
  return {
    month_number: Number(data.get("month_number")),
    ad_spend: Number(data.get("ad_spend")),
    price: Number(data.get("price")),
    holiday_index: Number(data.get("holiday_index")),
    competitor_price: Number(data.get("competitor_price"))
  };
}

function demoForecast(values) {
  const seasonalBoost = values.holiday_index * 230;
  const marketingLift = values.ad_spend * 0.16;
  const priceEffect = (30 - values.price) * 52;
  const competitorEffect = (values.competitor_price - values.price) * 45;
  const monthEffect = Math.sin((values.month_number / 12) * Math.PI) * 160;
  const forecast = Math.max(
    650,
    Math.round(520 + seasonalBoost + marketingLift + priceEffect + competitorEffect + monthEffect)
  );

  return {
    forecast_units: forecast,
    mean_absolute_percentage_error: 8.4,
    insight: buildDemoInsight(forecast, values)
  };
}

function buildDemoInsight(forecast, values) {
  if (forecast >= 2500) {
    return "High demand expected. Increase inventory and prepare fulfillment capacity.";
  }
  if (values.holiday_index >= 2) {
    return "Seasonal demand is rising. Plan promotional stock and campaign timing.";
  }
  if (values.price > 28) {
    return "Price is above the sweet spot. A discount could improve demand.";
  }
  return "Moderate demand expected. Monitor weekly sales and keep stock flexible.";
}

function showForecast(result, source) {
  const units = Number(result.forecast_units);
  forecastUnits.textContent = units.toLocaleString();
  heroForecast.textContent = units.toLocaleString();
  modelError.textContent = `Model error: MAPE ${result.mean_absolute_percentage_error}%`;
  heroError.textContent = `MAPE ${result.mean_absolute_percentage_error}%`;
  businessInsight.textContent = result.insight;
  forecastBar.style.width = `${Math.min(100, Math.max(18, (units / 3200) * 100))}%`;

  chartRows = [
    ...chartRows.filter((row) => !row.forecast).slice(-5),
    { month: "Forecast", units_sold: units, forecast: true }
  ];
  renderChart(chartRows);
  apiStatus.textContent = source === "api" ? "Connected" : "Demo Mode";
}

function renderDataset(rows) {
  datasetRows.innerHTML = rows
    .map(
      (row) => `
        <tr>
          <td>${row.month}</td>
          <td>${Number(row.ad_spend).toLocaleString()}</td>
          <td>${row.price}</td>
          <td>${row.holiday_index}</td>
          <td>${row.competitor_price}</td>
          <td>${Number(row.units_sold).toLocaleString()}</td>
        </tr>
      `
    )
    .join("");
}

function renderChart(rows) {
  const maxUnits = Math.max(...rows.map((row) => Number(row.units_sold)));
  chart.innerHTML = rows
    .map((row) => {
      const height = Math.max(24, (Number(row.units_sold) / maxUnits) * 260);
      return `
        <div class="bar ${row.forecast ? "forecast" : ""}">
          <div class="bar-fill" style="height: ${height}px"></div>
          <span>${row.month}</span>
          <span>${Number(row.units_sold).toLocaleString()}</span>
        </div>
      `;
    })
    .join("");
}

async function submitForecast(event) {
  event.preventDefault();
  const values = getFormData();

  try {
    const response = await fetch(`${API_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });

    if (!response.ok) {
      throw new Error("API unavailable");
    }

    const result = await response.json();
    showForecast(result, "api");
  } catch (error) {
    showForecast(demoForecast(values), "demo");
  }
}

async function loadDataset() {
  try {
    const response = await fetch(`${API_URL}/dataset`);
    if (!response.ok) {
      throw new Error("Dataset API unavailable");
    }

    const rows = await response.json();
    apiStatus.textContent = "Connected";
    renderDataset(rows);
    chartRows = [
      ...rows.slice(-5).map((row) => ({
        month: row.month,
        units_sold: Number(row.units_sold)
      })),
      chartRows[chartRows.length - 1]
    ];
    renderChart(chartRows);
  } catch (error) {
    apiStatus.textContent = "Demo Mode";
    renderChart(chartRows);
  }
}

form.addEventListener("submit", submitForecast);
loadDataset();
showForecast(demoForecast(getFormData()), "demo");
