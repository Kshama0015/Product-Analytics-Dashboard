from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from sqlalchemy import insert, text
from config import engine
from models import feature_clicks

track_routes = Blueprint("track_routes", __name__)

@track_routes.route("/track", methods=["POST"])
@jwt_required()
def track():

    data = request.json
    username = get_jwt_identity()

    with engine.connect() as conn:
        user_row = conn.execute(
            text("SELECT id FROM users WHERE username = :username"),
            {"username": username}
        ).fetchone()

    if not user_row:
        return jsonify({"error": "User not found"}), 404

    query = insert(feature_clicks).values(
        user_id=user_row[0],
        feature_name=data["feature_name"],
        timestamp=datetime.utcnow()
    )

    with engine.connect() as conn:
        conn.execute(query)
        conn.commit()

    return jsonify({"message": "event stored"})