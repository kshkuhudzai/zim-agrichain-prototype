from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import firebase_config
from .routes import listings, bids, transactions, drivers

app = FastAPI(title="ZimAgriChain API", version="1.0.0")

# Allow frontend (Vite dev server) and mobile apps
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(listings.router)
app.include_router(bids.router)
app.include_router(transactions.router)
app.include_router(drivers.router)
@app.get("/")
def root():
    return {"message": "ZimAgriChain API is running", "status": "operational"}

@app.get("/health")
def health():
    return {"status": "ok"}