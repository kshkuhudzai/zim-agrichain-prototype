# ZimAgriChain 🌾

**Offline‑first agricultural marketplace for Zimbabwe**

ZimAgriChain connects smallholder farmers with transporters and buyers – even when internet is unavailable. Farmers can post harvest listings with precise map locations, drivers bid on transport (with distance calculation), and farmers accept/reject bids. The platform includes email verification, password reset, order history, and live driver location sharing.

---

## ✨ Features

- **Offline‑first** – Farmers create listings without internet (saved locally, syncs later)
- **Role‑based dashboards** – Farmer, Driver, Buyer views with tailored actions
- **Live password strength & confirmation** – Secure sign‑up with real‑time feedback
- **Email notifications** – Farmer gets email on new bid; Driver gets email when bid accepted
- **Accept / Reject bids** – Farmer reviews and accepts the best transport offer
- **Map pickers** – Farmers select pickup and destination locations on interactive maps (search, current location, click)
- **Driver distance calculation** – Drivers see distance from their current location to each listing
- **Live driver location sharing** – After bid acceptance, driver's location updates every 10 seconds (visible to farmer)
- **Order history** – All users can view their completed transactions
- **Email verification** – New users must verify email before full access
- **Password reset** – “Forgot password” flow via email
- **Concurrency safe** – Bid acceptance uses Firestore transactions to prevent double‑accept
- **Role‑based access control (RBAC)** – Backend endpoints enforce user roles (farmer/driver/buyer)
- **Firestore security rules** – Protect data per user role
- **Immutable transaction log** – Blockchain‑inspired records for completed deals
- **PWA ready** – Progressive Web App manifest + service worker (offline caching)

---

## 🛠️ Tech Stack

| Layer        | Technology                                                                 |
|--------------|----------------------------------------------------------------------------|
| Frontend     | React 18, Vite, TailwindCSS, Redux Toolkit, Dexie (IndexedDB), Leaflet     |
| Backend      | FastAPI (Python), Uvicorn, Firebase Admin SDK                              |
| Database     | Firebase Firestore (real‑time + offline sync)                              |
| Auth         | Firebase Auth (email/password, email verification, password reset)         |
| Maps         | Leaflet + OpenStreetMap (free, no API key) with search and geolocation     |
| Notifications| Email via Gmail SMTP (or mock when offline)                                |
| Deployment   | Render (backend) + Netlify / Vercel (frontend)                             |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Firebase account (free tier)

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/zim-agrichain-prototype.git
cd zim-agrichain-prototype
2. Backend setup
bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
Create a .env file in backend/:

text
EMAIL_ADDRESS=your_email@gmail.com
EMAIL_PASSWORD=your_app_password   # Gmail App Password (optional – mock works without)
3. Firebase configuration
Create a Firebase project in Firebase Console

Enable Authentication → Email/Password, and also enable Email verification (optional but recommended)

Enable Firestore Database in test mode (then later apply security rules from firestore.rules)

Generate a service account private key (Project Settings → Service accounts → Generate new private key)

Save the JSON as backend/firebase-admin-sdk.json

Copy the web app config (Project Settings → General → Your apps) and paste into frontend/src/firebase.js

4. Frontend setup
bash
cd ../frontend
npm install
cp .env.example .env   # or create .env with VITE_API_BASE=http://localhost:8000
npm run dev
5. Run the backend
bash
cd ../backend
uvicorn app.main:app --reload --port 8000
Open http://localhost:5173 – sign up as farmer, driver, or buyer.

📁 Project Structure (updated)
text
zim-agrichain-prototype/
├── backend/
│   ├── app/
│   │   ├── routes/          # listings, bids, transactions, users, drivers
│   │   ├── services/        # email_client.py
│   │   ├── auth_deps.py     # Firebase token verification + role extraction
│   │   ├── firebase_config.py
│   │   ├── main.py
│   │   └── models.py
│   ├── requirements.txt
│   └── firebase-admin-sdk.json (gitignored)
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/      # FarmerDashboard, DriverDashboard, BuyerDashboard, Login, Signup, MapPicker, DestinationMapPicker, DriverMap, OrderHistory
│   │   ├── store/           # Redux + offline sync (IndexedDB)
│   │   ├── App.jsx
│   │   ├── firebase.js
│   │   └── main.jsx
│   ├── package.json
│   ├── .env                 # VITE_API_BASE
│   └── vite.config.js
├── firestore.rules          # Firestore security rules
├── .gitignore
└── README.md
🧪 Testing the Full Flow
Farmer signs up (email verification required), logs in, posts a listing with pickup & destination maps.

Driver signs up, logs in, sees available loads on map/list with distance, places a bid.

Farmer receives email notification, views bid under “My Listings & Bids”, clicks Accept.

Driver receives email notification, sees bid status “accepted”, and live location sharing begins.

Order History for both shows the transaction once delivery is confirmed (via a separate endpoint or manual creation).

📧 Email Notifications
If you do not set up EMAIL_ADDRESS/EMAIL_PASSWORD, the backend prints MOCK EMAIL to the terminal.

To enable real emails, create a Gmail App Password (Google Account → Security → App Passwords) and add to .env.

🗺️ Maps & Geolocation
Farmers select pickup and drop‑off points using Leaflet + OpenStreetMap with search and “Use My Current Location”.

Drivers see distance to pickup (Haversine formula) and can place bids directly from map markers.

After bid acceptance, driver's live location is stored in Firestore (updates every 10 seconds) and can be retrieved via API.

🔒 Security & Concurrency
Backend RBAC: Only farmers can create/listings; only drivers can place bids and update location; only listing owner can accept/reject bids.

Firestore security rules: Protect users, listings, bids, transactions, driver_locations per user role.

Transaction for bid acceptance: Uses Firestore transaction to atomically check status and update both bid and listing – prevents double acceptance.

Environment variables: API base URL and email credentials are stored in .env files (gitignored).

Email verification: New users must verify email before logging in (controlled in Login.jsx if desired).

🚧 Known Limitations & Next Steps
EcoCash / Paynow integration – Escrow payments not yet implemented (stubbed in /drivers/confirm-delivery).

Automated transaction creation – Currently must be created manually via endpoint; will be triggered on delivery confirmation.

Driver location persistence – Stored but not yet displayed in farmer dashboard (endpoint exists, UI pending).

Deployment – Backend to Render, frontend to Netlify/Vercel, with environment variables set.

🤝 Contributing
Pull requests are welcome. For major changes, please open an issue first.
Contact: [your email] or open a GitHub issue.

📄 License
MIT

🙏 Acknowledgements
Firebase for backend & real‑time database

FastAPI for the API framework

Leaflet & OpenStreetMap for free maps

All Zimbabwean farmers, drivers, and buyers who inspired this solution