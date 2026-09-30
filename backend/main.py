import os
import requests
from urllib.parse import urlparse, parse_qs

from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel

from backend.models import SocialPost, URLListRequest
from backend.analytics import calculate_engagement_rate

load_dotenv()

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

app = FastAPI()


class URLRequest(BaseModel):
    url: str


def extract_youtube_video_id(url: str):
    parsed_url = urlparse(url)

    if parsed_url.hostname in ["www.youtube.com", "youtube.com"]:
        return parse_qs(parsed_url.query).get("v", [None])[0]

    if parsed_url.hostname == "youtu.be":
        return parsed_url.path.lstrip("/")

    return None


def analyze_youtube(url: str):
    video_id = extract_youtube_video_id(url)

    if not video_id:
        return {
            "url": url,
            "error": "Could not extract a YouTube video ID"
        }

    response = requests.get(
        "https://www.googleapis.com/youtube/v3/videos",
        params={
            "part": "snippet,statistics",
            "id": video_id,
            "key": YOUTUBE_API_KEY
        }
    )

    data = response.json()

    if not data.get("items"):
        return {
            "url": url,
            "error": "YouTube video not found"
        }

    video = data["items"][0]

    post = SocialPost(
        platform="YouTube",
        post_id=video_id,
        author=video["snippet"]["channelTitle"],
        text=video["snippet"]["description"],
        published_at=video["snippet"]["publishedAt"],
        views=int(video["statistics"].get("viewCount", 0)),
        likes=int(video["statistics"].get("likeCount", 0)),
        comments=int(video["statistics"].get("commentCount", 0)),
        shares=0
    )

    return {
        **post.model_dump(),
        "engagement_rate": calculate_engagement_rate(post)
    }


@app.get("/")
def home():
    return {"message": "Social Media Correlator API is running!"}


@app.post("/analyze")
def analyze(request: URLRequest):
    return analyze_youtube(request.url)


@app.post("/analyze/batch")
def analyze_batch(request: URLListRequest):
    results = []

    for url in request.urls:
        results.append(analyze_youtube(url))

    return {"posts": results}