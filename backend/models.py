from datetime import datetime
from pydantic import BaseModel


class SocialPost(BaseModel):
    platform: str
    post_id: str
    author: str
    text: str | None = None
    published_at: datetime | None = None
    views: int = 0
    likes: int = 0
    comments: int = 0
    shares: int = 0

class URLListRequest(BaseModel):
    urls: list[str]