import sqlite3
from backend.models import SocialPost

DATABASE_NAME = "social_media.db"


def get_connection():
    return sqlite3.connect(DATABASE_NAME)


def initialize_database():
    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            platform TEXT NOT NULL,
            post_id TEXT NOT NULL UNIQUE,
            author TEXT NOT NULL,
            text TEXT,
            published_at TEXT,
            views INTEGER DEFAULT 0,
            likes INTEGER DEFAULT 0,
            comments INTEGER DEFAULT 0,
            shares INTEGER DEFAULT 0
        )
    """)

    connection.commit()
    connection.close()

def save_post(post: SocialPost):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        INSERT OR REPLACE INTO posts (
            platform,
            post_id,
            author,
            text,
            published_at,
            views,
            likes,
            comments,
            shares
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        post.platform,
        post.post_id,
        post.author,
        post.text,
        post.published_at.isoformat() if post.published_at else None,
        post.views,
        post.likes,
        post.comments,
        post.shares
    ))

    connection.commit()
    connection.close()


def get_all_posts():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            platform,
            post_id,
            author,
            text,
            published_at,
            views,
            likes,
            comments,
            shares
        FROM posts
    """)

    rows = cursor.fetchall()

    connection.close()

    return rows