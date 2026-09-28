from flask import (
    Flask,
    render_template,
    request,
    jsonify
)

from sentiment import analyze_sentiment

from database import (
    create_database,
    save_feedback,
    get_all_feedback,
    get_dashboard_stats,
    get_theme_stats
)


app = Flask(__name__)


# Create database/table
create_database()


# ==========================================
# HOME
# ==========================================

@app.route("/")
def home():

    return render_template(
        "index.html"
    )


# ==========================================
# ANALYZE FEEDBACK
# ==========================================

@app.route(
    "/analyze",
    methods=["POST"]
)
def analyze():

    data = request.get_json(
        silent=True
    ) or {}

    feedback = data.get(
        "feedback",
        ""
    ).strip()


    if not feedback:

        return jsonify({
            "error":
                "Please enter customer feedback."
        }), 400


    # Prevent extremely large input
    if len(feedback) > 3000:

        return jsonify({
            "error":
                "Feedback is too long. "
                "Please use less than 3000 characters."
        }), 400


    # NLP analysis
    result = analyze_sentiment(
        feedback
    )


    # Save analysis
    save_feedback(
        feedback,
        result["sentiment"],
        result["confidence"],
        result["themes"]
    )


    return jsonify(result)


# ==========================================
# FEEDBACK HISTORY
# ==========================================

@app.route(
    "/feedback",
    methods=["GET"]
)
def feedback_history():

    feedback_list = (
        get_all_feedback()
    )

    return jsonify(
        feedback_list
    )


# ==========================================
# DASHBOARD STATISTICS
# ==========================================

@app.route(
    "/stats",
    methods=["GET"]
)
def dashboard_statistics():

    stats = get_dashboard_stats()

    return jsonify(stats)


# ==========================================
# THEME STATISTICS
# ==========================================

@app.route(
    "/themes",
    methods=["GET"]
)
def theme_statistics():

    stats = get_theme_stats()

    return jsonify(stats)


# ==========================================
# START APPLICATION
# ==========================================

if __name__ == "__main__":

    app.run(
        debug=True
    )