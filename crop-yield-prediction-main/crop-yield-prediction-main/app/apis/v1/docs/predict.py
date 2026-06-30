YIELD_PREDICTION_API_DOCS = """# Crop Yield Prediction API

Predict crop yield based on environmental and agricultural parameters using a trained machine learning model.

## Endpoint

### `POST /yield-production`

Submit crop and environmental data to receive predicted crop yield.

## Request

**Content-Type:** `application/json`

### Request Body Parameters

| Name                              | Type   | Required | Description                                      |
|----------------------------------|--------|----------|--------------------------------------------------|
| `Area`                           | string | Yes      | Country or region name                           |
| `Item`                           | string | Yes      | Crop name (e.g., Rice, Wheat)                    |
| `average_rain_fall_mm_per_year`  | float  | Yes      | Average annual rainfall in millimeters           |
| `pesticides_tonnes`              | float  | Yes      | Pesticides usage in tonnes                       |
| `avg_temp`                       | float  | Yes      | Average temperature in degree Celsius            |

### Example Request

```json
{
  "Area": "India",
  "Item": "Rice",
  "average_rain_fall_mm_per_year": 1200,
  "pesticides_tonnes": 300,
  "avg_temp": 28
}
````

## Validations

* All fields are mandatory
* `Area` and `Item` must match trained categories
* Numeric fields must be valid numbers
* Unknown categorical values will be rejected

## Response (200 OK)

```json
{
  "code": 200,
  "success": true,
  "data": {
    "predicted_yield": 98500.75
  },
  "msg": "Crop yield prediction successful."
}
```

## Response Fields

| Field             | Type  | Description                                            |
| ----------------- | ----- | ------------------------------------------------------ |
| `predicted_yield` | float | Predicted crop yield in hectograms per hectare (hg/ha) |

## Error Responses

### 400 – Validation Error

```json
{
  "code": 400,
  "success": false,
  "data": {},
  "msg": "Could not validate data"
}
```

### 422 – Invalid Input

```json
{
  "code": 422,
  "success": false,
  "data": {},
  "msg": "Invalid request payload"
}
```

### 500 – Internal Server Error

```json
{
  "code": 500,
  "success": false,
  "data": {},
  "msg": "Internal Server Error"
}
```

## Notes
* The model uses log-transformed targets internally
* Predictions are deterministic for identical inputs
"""