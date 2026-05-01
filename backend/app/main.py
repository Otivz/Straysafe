from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

# Add the parent directory to sys.path to allow importing siblings of 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, Base
from app.routes import auth, users, reports, rescue

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="StraySafe API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.staticfiles import StaticFiles

# Create uploads directory if it doesn't exist
os.makedirs("uploads", exist_ok=True)

# Mount the uploads directory to serve static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


# Include routes
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(reports.router)
app.include_router(rescue.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to StraySafe API"}
