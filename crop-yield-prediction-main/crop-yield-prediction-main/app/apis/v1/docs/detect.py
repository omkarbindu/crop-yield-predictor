DETECT_API_DOCS = """# Pest & Disease Detection API

Detect pests and crop diseases from an uploaded image using AI-based image analysis.

## Endpoint

### `POST /detect-pest-disease`

Upload a crop image and get pest/disease detection results.

## Request

**Content-Type:** `multipart/form-data`

### Parameters

| Name       | Type       | Required | Description                 |
| ---------- | ---------- | -------- | --------------------------- |
| `crop_img` | UploadFile | Yes    | Crop image (JPG, JPEG, PNG) |

## Validations

* Allowed formats: `jpg`, `jpeg`, `png`
* Max file size: **5 MB**
* Empty files are rejected

## Response (200 OK)
```json
{
  "code": 200,
  "success": true,
  "data": {
    "pest_detected": true,
    "disease_detected": false,
    "pest_name": "Aphids",
    "confidence": 0.92
  },
  "msg": "Detection completed successfully."
}
```

### Error Responses

### 400 – Invalid file
```json
{
  "code": 400,
  "success": false,
  "data": {},
  "msg": "Invalid file type. Only JPG, JPEG, PNG are allowed."
}
```

### 413 – File too large
```json
{
  "code": 413,
  "success": false,
  "data": {},
  "msg": "File size exceeds 5MB limit."
}
```

### 500 – Server error
```json
{
  "code": 500,
  "success": false,
  "data": {},
  "msg": "Internal Server Error"
}
```
"""

