# Sales & Demand Forecasting Internship Project

This project is a complete mini machine-learning web application for **Task 1:
Sales & Demand Forecasting for Businesses**.

The website helps a business forecast future product demand using historical
sales data. It includes a clean frontend dashboard, a Flask backend API, a sample
business dataset, a regression-based forecasting model, forecast visualization,
and business-ready insights.

## About The Website

The website is designed as a business forecasting dashboard. Users can enter
future business conditions such as forecast month, advertisement spend, product
price, holiday season level, and competitor price. The model then predicts the
expected number of units sold.

The website also shows:

- Frontend website
- Backend API
- Sample dataset
- Sales demand forecasting model
- Forecast visualization
- Model error analysis
- Business insights for stock, pricing, and marketing decisions

## Project Structure

```text
ML/
  index.html
  ml.html
  README.md

  backend/
    app.py
    requirements.txt

  dataset/
    sales_demand.csv

  frontend/
    index.html
    style.css
    script.js
```

## File Details

```text
index.html
  Main entry file for opening the website from the root folder.

ml.html
  Redirect page that opens the full forecasting dashboard.

frontend/index.html
  Main frontend page containing the sales forecasting dashboard layout.

frontend/style.css
  CSS file for the unique dashboard design, colors, charts, cards, and layout.

frontend/script.js
  JavaScript file that connects the frontend to the backend API, displays
  predictions, loads dataset rows, and draws the forecast chart.

backend/app.py
  Flask backend API that loads the dataset, trains the regression model,
  evaluates error, and returns demand forecasts.

backend/requirements.txt
  Python packages required to run the backend.

dataset/sales_demand.csv
  Historical business dataset used for sales and demand forecasting.

README.md
  Project explanation, file structure, and running instructions.
```

## How To Run

1. Open a terminal in this folder.
2. Install backend requirements:

```bash
pip install -r backend/requirements.txt
```

3. Start the backend:

```bash
python backend/app.py
```

4. Open `frontend/index.html` in your browser.

The frontend can work in demo mode even if the backend is not running.

## Project Idea

The website forecasts future product demand using historical business data such as
month, advertisement spend, product price, holiday season index, competitor price,
and previous unit sales. It demonstrates data cleaning, time-based feature
engineering, regression forecasting, model evaluation, error analysis, and
business-friendly visual output.
