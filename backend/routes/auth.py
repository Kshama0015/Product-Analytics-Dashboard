from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from sqlalchemy import text, insert
import bcrypt
from config import engine
from models import users as users_table

auth_routes = Blueprint("auth_routes", __name__)

@auth_routes.route("/register", methods=["POST"])
def register():

    data = request.json
    username = data.get("username")
    password = data.get("password")
    age = data.get("age")
    gender = data.get("gender")

    if not username or not password:
        return {"error": "Username and password are required"}, 400

    with engine.connect() as conn:
        existing = conn.execute(
            text("SELECT id FROM users WHERE username = :username"),
            {"username": username}
        ).fetchone()

        if existing:
            return {"error": "Username already exists"}, 409

        hashed = bcrypt.hashpw(
            password.encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")

        conn.execute(
            insert(users_table).values(
                username=username,
                password=hashed,
                age=age,
                gender=gender
            )
        )
        conn.commit()

    return {"message": "User created successfully"}, 201
    

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