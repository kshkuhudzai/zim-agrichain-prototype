import firebase_admin
from firebase_admin import credentials, firestore, auth
import os
import json

# Path to your service account key (downloaded from Firebase Console)
# Make sure firebase-admin-sdk.json is in the backend/ folder
CRED_PATH = os.path.join(os.path.dirname(__file__), "..", "firebase-admin-sdk.json")

# Initialize Firebase Admin SDK if not already initialized
if not firebase_admin._apps:
    try:
        cred = credentials.Certificate(CRED_PATH)
        firebase_admin.initialize_app(cred)
        print("Firebase Admin SDK initialized successfully")
    except Exception as e:
        print(f"Error initializing Firebase: {e}")
        raise

# Firestore database reference
db = firestore.client()

# Auth reference (for user management)
auth_client = auth

def get_db():
    """Return Firestore client instance"""
    return db

def verify_firebase_token(token: str):
    """Verify Firebase ID token (for future authentication)"""
    try:
        decoded_token = auth_client.verify_id_token(token)
        return decoded_token
    except Exception as e:
        return None