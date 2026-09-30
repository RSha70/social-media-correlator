from backend.models import SocialPost


def calculate_engagement_rate(post: SocialPost) -> float:
    if post.views == 0:
        return 0.0

    engagement = post.likes + post.comments + post.shares

    return engagement / post.views