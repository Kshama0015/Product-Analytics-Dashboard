from flask import Blueprint, request, jsonify
from sqlalchemy import text
from config import engine

analytics_routes = Blueprint("analytics_routes", __name__)


@analytics_routes.route("/analytics", methods=["GET"])
def analytics():

    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    age = request.args.get("age")
    gender = request.args.get("gender")

    query = """
        SELECT fc.feature_name, COUNT(*) as total
        FROM feature_clicks fc
        JOIN users u ON fc.user_id = u.id
        WHERE 1=1
    """

    params = {}

    # Date filters
    if start_date and end_date:
        query += " AND fc.timestamp BETWEEN :start_date AND :end_date"
        params["start_date"] = start_date
        params["end_date"] = end_date

    # Age filters
    if age == "<18":
        query += " AND u.age < 18"

    elif age == "18-40":
        query += " AND u.age BETWEEN 18 AND 40"

    elif age == ">40":
        query += " AND u.age > 40"

    # Gender filter
    if gender:
        query += " AND u.gender = :gender"
        params["gender"] = gender

    query += " GROUP BY fc.feature_name"

    with engine.connect() as conn:

        result = conn.execute(text(query), params)

        data = {row[0]: row[1] for row in result}

    return jsonify(data)

@analytics_routes.route("/analytics/daily", methods=["GET"])
def analytics_daily():

    feature = request.args.get("feature")

    query = text("""
        SELECT DATE(timestamp) as day, COUNT(*) as total
        FROM feature_clicks
        WHERE feature_name = :feature
        GROUP BY day
        ORDER BY day
    """)

    with engine.connect() as conn:

        result = conn.execute(query, {"feature": feature})

        data = [
            {"date": str(row[0]), "clicks": row[1]}
            for row in result
        ]

    return jsonify(data)