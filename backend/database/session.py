import os
from sqlmodel import SQLModel, Session, create_engine
from dotenv import load_dotenv
import json
from database.seed_database import seed_database

load_dotenv()

DB_HOST = os.getenv("DB_HOST")          # URL
DB_NAME = os.getenv("DB_NAME")          # name
DB_USER = os.getenv("DB_USER")          # username
DB_PASSWORD = os.getenv("DB_PASSWORD")  # password

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"
engine = create_engine(DATABASE_URL, echo=True)
SQLModel.metadata.drop_all(engine)
SQLModel.metadata.create_all(engine)
seed_database(engine)
print(f"Database connected to: {DATABASE_URL}")
print("Database tables recreated from models")

def get_session():
    with Session(engine) as session:
        yield session

