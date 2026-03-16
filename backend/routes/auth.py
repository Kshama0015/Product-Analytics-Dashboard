from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
import bcrypt

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

    for user in users:
        if user["username"] == data["username"]:

            if bcrypt.checkpw(
                data["password"].encode("utf-8"),
                user["password"]
            ):

                token = create_access_token(identity=user["username"])

                return {"token": token}

    return {"error": "invalid credentials"}, 401