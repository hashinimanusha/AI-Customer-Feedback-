import sqlite3
from datetime import datetime


DATABASE_NAME = "feedback.db"


def get_connection():
    connection = sqlite3.connect(
        DATABASE_NAME
    )

    connection.row_factory = sqlite3.Row

    return connection


# ==========================================
# CREATE DATABASE
# ==========================================

def create_database():

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS feedback (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            comment TEXT NOT NULL,

            sentiment TEXT NOT NULL,

            confidence REAL NOT NULL,

            themes TEXT,

            created_at TEXT NOT NULL
        )
    """)

    connection.commit()

    connection.close()


# ==========================================
# SAVE FEEDBACK
# ==========================================

def save_feedback(
    comment,
    sentiment,
    confidence,
    themes
):

    connection = get_connection()

    cursor = connection.cursor()

    themes_text = ", ".join(themes)

    created_at = datetime.now().strftime(
        "%Y-%m-%d %H:%M:%S"
    )

    cursor.execute("""
        INSERT INTO feedback
        (
            comment,
            sentiment,
            confidence,
            themes,
            created_at
        )

        VALUES (?, ?, ?, ?, ?)
    """, (
        comment,
        sentiment,
        confidence,
        themes_text,
        created_at
    ))

    connection.commit()

    connection.close()


# ==========================================
# GET ALL FEEDBACK
# ==========================================

def get_all_feedback():

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute("""
        SELECT *
        FROM feedback
        ORDER BY id DESC
    """)

    rows = cursor.fetchall()

    connection.close()

    return [
        dict(row)
        for row in rows
    ]


# ==========================================
# DASHBOARD STATISTICS
# ==========================================

def get_dashboard_stats():

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute("""
        SELECT

            COUNT(*) AS total,

            SUM(
                CASE
                    WHEN sentiment = 'Positive'
                    THEN 1
                    ELSE 0
                END
            ) AS positive,

            SUM(
                CASE
                    WHEN sentiment = 'Neutral'
                    THEN 1
                    ELSE 0
                END
            ) AS neutral,

            SUM(
                CASE
                    WHEN sentiment = 'Negative'
                    THEN 1
                    ELSE 0
                END
            ) AS negative

        FROM feedback
    """)

    row = cursor.fetchone()

    connection.close()

    return {
        "total": row["total"] or 0,
        "positive": row["positive"] or 0,
        "neutral": row["neutral"] or 0,
        "negative": row["negative"] or 0
    }


# ==========================================
# THEME STATISTICS
# ==========================================

def get_theme_stats():

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute("""
        SELECT themes
        FROM feedback
        WHERE themes IS NOT NULL
        AND themes != ''
    """)

    rows = cursor.fetchall()

    connection.close()

    theme_counts = {}

    for row in rows:

        themes = row["themes"].split(",")

        for theme in themes:

            theme = theme.strip()

            if not theme:
                continue

            theme_counts[theme] = (
                theme_counts.get(theme, 0) + 1
            )


    # Sort highest to lowest
    sorted_themes = sorted(
        theme_counts.items(),
        key=lambda item: item[1],
        reverse=True
    )

    return dict(sorted_themes)