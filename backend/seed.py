import random
from datetime import datetime, timedelta
from faker import Faker
from sqlalchemy import insert
import bcrypt

from config import engine
from models import users, feature_clicks

fake = Faker()

features = [
    "date_filter",
    "gender_filter",
    "age_filter",
    "bar_chart_zoom",
    "line_chart_hover"
]

print("Seeding database...")

with engine.connect() as conn:

    user_ids = []

    # create 5 users
    for _ in range(5):

        password = "password123"

        hashed_password = bcrypt.hashpw(
            password.encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")

        query = insert(users).values(
            username=fake.user_name(),
            password=hashed_password,
            age=random.randint(20, 40),
            gender=random.choice(["M", "F"])
        )

        result = conn.execute(query)
        user_ids.append(result.inserted_primary_key[0])

    # create 100 feature clicks
    for _ in range(100):

        query = insert(feature_clicks).values(
            user_id=random.choice(user_ids),
            feature_name=random.choice(features),
            timestamp=datetime.utcnow() - timedelta(days=random.randint(0, 30))
        )

        conn.execute(query)

    conn.commit()

print("Database seeded successfully!")