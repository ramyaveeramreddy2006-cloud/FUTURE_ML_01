from pathlib import Path

import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_absolute_percentage_error
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler


BASE_DIR = Path(__file__).resolve().parent.parent
DATASET_PATH = BASE_DIR / "dataset" / "sales_demand.csv"
FEATURES = ["month_number", "ad_spend", "price", "holiday_index", "competitor_price"]

app = Flask(__name__)
CORS(app)


def prepare_data():
    data = pd.read_csv(DATASET_PATH)
    data["month_date"] = pd.to_datetime(data["month"])
    data["month_number"] = data["month_date"].dt.month
    return data


def load_model():
    data = prepare_data()
    x = data[FEATURES]
    y = data["units_sold"]

    model = Pipeline(
        steps=[
            ("scaler", StandardScaler()),
            ("regressor", RandomForestRegressor(n_estimators=120, random_state=42)),
        ]
    )
    model.fit(x, y)

    x_train, x_test, y_train, y_test = train_test_split(
        x, y, test_size=0.28, random_state=42
    )
    score_model = Pipeline(
        steps=[
            ("scaler", StandardScaler()),
            ("regressor", RandomForestRegressor(n_estimators=120, random_state=42)),
        ]
    )
    score_model.fit(x_train, y_train)
    predictions = score_model.predict(x_test)
    mae = round(mean_absolute_error(y_test, predictions), 2)
    mape = round(mean_absolute_percentage_error(y_test, predictions) * 100, 2)

    return model, mae, mape, len(data)


MODEL, MAE, MAPE, ROW_COUNT = load_model()


@app.get("/")
def home():
    return jsonify(
        {
            "project": "Sales and Demand Forecasting API",
            "status": "running",
            "dataset_rows": ROW_COUNT,
            "mean_absolute_error": MAE,
            "mean_absolute_percentage_error": MAPE,
        }
    )


@app.get("/dataset")
def dataset_preview():
    data = pd.read_csv(DATASET_PATH)
    return jsonify(data.to_dict(orient="records"))


@app.post("/predict")
def predict():
    payload = request.get_json(force=True)
    required_fields = [
        "month_number",
        "ad_spend",
        "price",
        "holiday_index",
        "competitor_price",
    ]

    missing = [field for field in required_fields if field not in payload]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    sample = pd.DataFrame([{field: float(payload[field]) for field in required_fields}])
    forecast = round(float(MODEL.predict(sample)[0]))

    return jsonify(
        {
            "forecast_units": forecast,
            "mean_absolute_error": MAE,
            "mean_absolute_percentage_error": MAPE,
            "insight": build_insight(forecast, payload),
        }
    )


def build_insight(forecast, payload):
    ad_spend = float(payload["ad_spend"])
    holiday_index = float(payload["holiday_index"])
    price = float(payload["price"])

    if forecast >= 2500:
        return "High demand expected. Prepare inventory, staff, and delivery capacity early."
    if holiday_index >= 2 and ad_spend >= 9000:
        return "Seasonal campaign is strong. Keep pricing steady and monitor stock-outs."
    if price > 28:
        return "Demand may soften because price is high. Consider a promotion or bundle."
    return "Moderate demand expected. Track weekly sales and adjust marketing spend."


if __name__ == "__main__":
    app.run(debug=True, port=5000)
