from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from routes.track import track_routes
from routes.analytics import analytics_routes

from routes.auth import auth_routes

app = Flask(__name__)

# Secret key for JWT
app.config["JWT_SECRET_KEY"] = "super-secret"

# Enable CORS for frontend
CORS(app)

# Initialize JWT
jwt = JWTManager(app)

# Register routes
app.register_blueprint(auth_routes)
app.register_blueprint(track_routes)
app.register_blueprint(analytics_routes)

@app.route("/")
def home():
    return {"message": "API running"}

if __name__ == "__main__":
    app.run(debug=True)