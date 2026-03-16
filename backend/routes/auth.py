from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from sqlalchemy import text
import bcrypt
from config import engine

auth_routes = Blueprint("auth_routes", __name__)

users = []

@auth_routes.route("/register", methods=["POST"])
def register():

    data = request.json

    hashed = bcrypt.hashpw(
        data["password"].encode("utf-8"),
        bcrypt.gensalt()
    )

    user = {
        "username": data["username"],
        "password": hashed
    }

    users.append(user)

    return {"message": "user created"}
    

@auth_routes.route("/login", methods=["POST"])
def login():

    data = request.json

    print("Login request received:", data)

    query = text("""
        SELECT username, password
        FROM users
        WHERE username = :username
    """)

    with engine.connect() as conn:

        result = conn.execute(query, {"username": data["username"]}).fetchone()

        print("DB result:", result)

        if result is None:
            print("User not found")
            return {"error": "invalid credentials"}, 401

        stored_password = result[1]

        print("Stored hash:", stored_password)

        password_match = bcrypt.checkpw(
            data["password"].encode("utf-8"),
            stored_password.encode("utf-8")
        )

        print("Password match:", password_match)

        if password_match:

            token = create_access_token(identity=result[0])

            print("Login successful")

            return {"token": token}

    print("Login failed")
    return {"error": "invalid credentials"}, 401