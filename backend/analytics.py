from backend.models import SocialPost
from datetime import datetime

def calculate_engagement_rate(post: SocialPost) -> float:
    if post.views == 0:
        return 0.0

    engagement = post.likes + post.comments + post.shares

    return engagement / post.views
def calculate_description_length(text: str | None) -> int:
    if not text:
        return 0

    return len(text)


def count_links(text: str | None) -> int:
    if not text:
        return 0

    return text.count("http://") + text.count("https://")


def count_mentions(text: str | None) -> int:
    if not text:
        return 0

    return text.count("@")


def extract_posting_hour(published_at: datetime | None) -> int | None:
    if not published_at:
        return None

    return published_at.hour