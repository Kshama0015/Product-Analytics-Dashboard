from flask import Blueprint, jsonify
from collections import Counter
from routes.track import events

analytics_routes = Blueprint("analytics_routes", __name__)

@analytics_routes.route("/analytics", methods=["GET"])
def analytics():

    query = text("""
        SELECT feature_name, COUNT(*) as total
        FROM feature_clicks
        GROUP BY feature_name
    """)

    with engine.connect() as conn:
        result = conn.execute(query)

        data = {row[0]: row[1] for row in result}

    return jsonify(data)