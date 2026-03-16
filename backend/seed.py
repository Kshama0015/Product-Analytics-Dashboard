from config import engine
from models import metadata

print("Creating tables...")
metadata.create_all(engine)

print("Tables created successfully")