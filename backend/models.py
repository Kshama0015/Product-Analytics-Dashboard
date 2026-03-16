from sqlalchemy import Table, Column, Integer, String, DateTime, MetaData, ForeignKey
from datetime import datetime

metadata = MetaData()

users = Table(
    "users",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("username", String, unique=True),
    Column("password", String),
    Column("age", Integer),
    Column("gender", String),
)

feature_clicks = Table(
    "feature_clicks",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("user_id", Integer, ForeignKey("users.id")),
    Column("feature_name", String),
    Column("timestamp", DateTime, default=datetime.utcnow),
)