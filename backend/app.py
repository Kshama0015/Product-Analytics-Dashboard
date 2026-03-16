from datetime import timedelta
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from routes.track import track_routes
from routes.analytics import analytics_routes

from routes.auth import auth_routes

app = Flask(__name__)

# Secret key for JWT
app.config["JWT_SECRET_KEY"] = "super-secret"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=7)

# Enable CORS for frontend
CORS(app, origins=["http://localhost:5173", "https://product-analytics-dashboard-taupe.vercel.app"], supports_credentials=True)

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
    app.run(debug=True, port=5001)