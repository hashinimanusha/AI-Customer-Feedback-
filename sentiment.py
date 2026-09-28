from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

analyzer = SentimentIntensityAnalyzer()


THEMES = {
    "Delivery": [
        "delivery",
        "delivered",
        "late",
        "delay",
        "delayed",
        "shipping",
        "courier",
        "arrived",
        "arrival"
    ],

    "Product Quality": [
        "quality",
        "product",
        "broken",
        "damaged",
        "defective",
        "excellent",
        "poor quality"
    ],

    "Customer Service": [
        "service",
        "support",
        "customer service",
        "staff",
        "employee",
        "agent",
        "helpful",
        "rude"
    ],

    "Price": [
        "price",
        "expensive",
        "cheap",
        "cost",
        "affordable",
        "money"
    ],

    "Payment": [
        "payment",
        "pay",
        "card",
        "checkout",
        "transaction"
    ],

    "Website / App": [
        "website",
        "app",
        "application",
        "login",
        "page",
        "slow",
        "error"
    ],

    "Returns / Refunds": [
        "return",
        "returned",
        "refund",
        "refunded",
        "money back",
        "replacement"
    ],

    "Packaging": [
        "package",
        "packaging",
        "box",
        "parcel"
    ]
}


def detect_themes(text):
    text_lower = text.lower()

    detected_themes = []

    for theme, keywords in THEMES.items():

        for keyword in keywords:

            if keyword in text_lower:

                detected_themes.append(theme)

                break

    if not detected_themes:
        detected_themes.append("General")

    return detected_themes


def analyze_sentiment(text):
    scores = analyzer.polarity_scores(text)

    compound_score = scores["compound"]

    if compound_score >= 0.05:
        sentiment = "Positive"

    elif compound_score <= -0.05:
        sentiment = "Negative"

    else:
        sentiment = "Neutral"

    # This is sentiment strength rather than
    # a true ML probability/confidence value.
    sentiment_score = round(
        abs(compound_score) * 100,
        2
    )

    themes = detect_themes(text)

    return {
        "sentiment": sentiment,
        "confidence": sentiment_score,
        "themes": themes,
        "scores": scores
    }