<h1 align="center">
    CropPulse AI
</h1>

<p align="center">
    An AI powered App backend for predicting yield prediction, pest and disease detection.
</p>

## Tech Stack

| Component                   | Technology Used        |
|-----------------------------|------------------------|
| **Language**                | Python                 |
| **Web Framework & Backend** | FastAPI                |
| **Model Training**          | Scikit Learn & YOLOv11 |

## Datasets Used for Training
- [Crop Yield Prediction](https://www.kaggle.com/datasets/patelris/crop-yield-prediction-dataset)
- [Crop Pest Detection](https://universe.roboflow.com/oakwood-agritech/crop-disease-detection-pelie)
- [Crop Disease Detection](https://universe.roboflow.com/ip102110000/yoloip1/dataset/1)

## How to Run the Project

### Clone the Repository
```bash
git clone 
```

### Navigate to Project Directory

```bash
cd 
```

### Create a Python Virtual Environment

> **Required Python version:** `3.12.3`

#### For Windows:

```bash
python -m venv venv
venv\Scripts\activate
```

#### For macOS:

```bash
python3 -m venv venv
source venv/bin/activate
```

#### For Linux:

```bash
python3 -m venv venv
source venv/bin/activate
```

### Install Required Dependencies

```bash
pip install -r requirements.txt
```

> **Note:** Refer to `.env.example` for the correct variable format.

### Start the Application

```bash
python main.py
```

Your Detector app should now be up and running 🎉

## Run with Docker

### Build the docker image of Project
```bash
docker build -t universe/croppulse .
```

### Run the docker container with env file
```
docker run -d \
    --env-file .env \
    -p 8000:8000 \
    --name croppulse \
    universe/croppulse
``` 

<br/>
<br/>
<br/>
<p align="center">
    Made with ❤️
</p>
