import os
import requests
from urllib.parse import urlparse, parse_qs

from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel

from backend.models import SocialPost, URLListRequest
from backend.analytics import (
    calculate_engagement_rate,
    calculate_description_length,
    count_links,
    count_mentions,
    extract_posting_hour
)
from backend.correlations import pearson_correlation

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
    "engagement_rate": calculate_engagement_rate(post),
    "description_length": calculate_description_length(post.text),
    "link_count": count_links(post.text),
    "mention_count": count_mentions(post.text),
    "posting_hour": extract_posting_hour(post.published_at)
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

    valid_posts = [
        post for post in results
        if "engagement_rate" in post
    ]

    if len(valid_posts) >= 2:
        views = [post["views"] for post in valid_posts]
        likes = [post["likes"] for post in valid_posts]
        comments = [post["comments"] for post in valid_posts]
        engagement_rates = [
        post["engagement_rate"]
        for post in valid_posts
        ]

        description_lengths = [
            post["description_length"]
            for post in valid_posts
        ]   

        link_counts = [
            post["link_count"]
        for post in valid_posts
        ]

        mention_counts = [
            post["mention_count"]
            for post in valid_posts
        ]

        posting_hours = [
            post["posting_hour"]
            for post in valid_posts
        ]

        correlations = {
        "sample_size": len(valid_posts),

        "views_vs_likes": pearson_correlation(
            views, likes
        ),

        "views_vs_comments": pearson_correlation(
            views, comments
        ),

        "views_vs_engagement_rate": pearson_correlation(
            views, engagement_rates
        ),

        "likes_vs_comments": pearson_correlation(
            likes, comments
        ),

        "description_length_vs_engagement_rate": pearson_correlation(
            description_lengths, engagement_rates
        ),

        "link_count_vs_engagement_rate": pearson_correlation(
            link_counts, engagement_rates
        ),

        "mention_count_vs_engagement_rate": pearson_correlation(
            mention_counts, engagement_rates
        ),

        "posting_hour_vs_engagement_rate": pearson_correlation(
            posting_hours, engagement_rates
        )
        }
    else:
        correlations = None

    return {
    "posts": results,
    "summary": {
        "sample_size": len(valid_posts),
        "features_analyzed": [
            "views",
            "likes",
            "comments",
            "engagement_rate",
            "description_length",
            "link_count",
            "mention_count",
            "posting_hour"
        ]
    },
    "correlations": correlations
}