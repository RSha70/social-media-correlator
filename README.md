# Social Media Correlator

A tool for analyzing social media posts and looking at what factors are associated with engagement.

Right now, the project focuses on YouTube. You can submit individual video URLs or a batch of URLs, pull information from the YouTube Data API, calculate engagement metrics, and compare different post features.

## What it does

* Analyzes YouTube videos from their URLs
* Collects views, likes, comments, descriptions, authors, and publish times
* Calculates engagement rate
* Extracts simple content features:

  * Description length
  * Number of links
  * Number of mentions
  * Posting hour
* Calculates correlations between post features and engagement
* Stores analyzed posts in a local SQLite database
* Provides a FastAPI backend for accessing the data

## Current API

### `GET /`

Checks that the API is running.

### `POST /analyze`

Analyzes one YouTube video.

Example request:

```json
{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

### `POST /analyze/batch`

Analyzes multiple YouTube videos and calculates correlations across the results.

Example request:

```json
{
  "urls": [
    "https://www.youtube.com/watch?v=VIDEO_ID_1",
    "https://www.youtube.com/watch?v=VIDEO_ID_2",
    "https://www.youtube.com/watch?v=VIDEO_ID_3"
  ]
}
```

### `GET /posts`

Returns posts that have been saved to the local database.

## Tech stack

* Python
* FastAPI
* SQLite
* Pydantic
* YouTube Data API
* Uvicorn

## Project structure

```text
social-media-correlator/
├── backend/
│   ├── main.py
│   ├── models.py
│   ├── analytics.py
│   ├── correlations.py
│   └── database.py
├── .env
├── .gitignore
├── README.md
└── social_media.db
```

`.env` and `social_media.db` are kept out of version control.

## Running locally

Clone the repository and create a virtual environment:

```powershell
python -m venv .venv
```

Activate it in PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

Install the dependencies:

```powershell
pip install -r requirements.txt
```

Create a `.env` file in the project root:

```text
YOUTUBE_API_KEY=your_api_key_here
```

Start the API:

```powershell
uvicorn backend.main:app --reload
```

The API will run at:

```text
http://127.0.0.1:8000
```

FastAPI's interactive documentation is available at:

```text
http://127.0.0.1:8000/docs
```

## Notes

The correlation results are only as useful as the data being analyzed. A small number of videos can produce misleading correlations, so the goal is to eventually analyze a much larger dataset.

The project currently uses SQLite for local storage. A hosted database can be added later as the project grows.

## Next steps

* Build a frontend dashboard
* Add visualizations for engagement and correlations
* Analyze larger datasets
* Add additional social media platforms
* Improve the statistical analysis
* Move from local SQLite to a production database
