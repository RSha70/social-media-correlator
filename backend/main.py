from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class URLRequest(BaseModel):
    url: str


@app.get("/")
def home():
    return {"message": "Social Media Correlator API is running!"}


@app.post("/analyze")
def analyze(request: URLRequest):
    url = request.url.lower()

    if "youtube.com" in url or "youtu.be" in url:
        platform = "YouTube"
    elif "tiktok.com" in url:
        platform = "TikTok"
    elif "instagram.com" in url:
        platform = "Instagram"
    elif "x.com" in url or "twitter.com" in url:
        platform = "X"
    else:
        platform = "Unknown"

    return {
        "url": request.url,
        "platform": platform,
        "status": "received"
    }