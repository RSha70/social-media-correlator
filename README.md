# social-media-correlator
A full-stack social media analytics platform that lets users paste public social media links, aggregates and normalizes available engagement data, and identifies correlations between content, posting patterns, and audience engagement.

## Tech Stack

* Python
* FastAPI
* React
* TypeScript
* PostgreSQL

## Project Structure

```text
social-media-correlator/
├── backend/
│   └── main.py
├── .gitignore
└── README.md
```

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/RSha70/social-media-correlator.git
cd social-media-correlator
```

### 2. Create a virtual environment

```bash
python -m venv .venv
```

### 3. Activate the virtual environment

Windows PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

### 4. Install dependencies

```bash
pip install fastapi uvicorn
```

### 5. Run the backend

```bash
uvicorn backend.main:app --reload
```

The API will be available at:

```text
http://127.0.0.1:8000
```

Interactive API documentation:

```text
http://127.0.0.1:8000/docs
```

## Current Status

* [x] GitHub repository setup
* [x] Python environment setup
* [x] FastAPI backend setup
* [x] Initial API endpoint
* [ ] Social media URL ingestion
* [ ] Data normalization
* [ ] PostgreSQL database
* [ ] Correlation analysis
* [ ] React frontend
* [ ] Analytics dashboard
