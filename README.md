# ZimAgriChain 🌾

**Offline‑first agricultural marketplace for Zimbabwe**

ZimAgriChain connects smallholder farmers with transporters and buyers – even when internet is unavailable. Farmers can post harvest listings, drivers bid on transport, and buyers purchase produce. The platform works offline, syncs automatically when connectivity returns, and sends email alerts for bids and acceptances.

---

## ✨ Features

- **Offline‑first** – Farmers create listings without internet (saved locally, syncs later)
- **Role‑based dashboards** – Farmer, Driver, Buyer views with tailored actions
- **Live password strength & confirmation** – Secure sign‑up with real‑time feedback
- **Email notifications** – Farmer gets email on new bid; Driver gets email when bid accepted
- **Accept / Reject bids** – Farmer reviews and accepts the best transport offer
- **Firebase Authentication** – Email/password login, user profiles stored in Firestore
- **Backend API** – FastAPI with token verification (Firebase ID tokens)
- **Immutable transaction log** – Blockchain‑inspired records for completed deals
- **PWA ready** – Progressive Web App manifest + service worker (offline caching)

---

## 🛠️ Tech Stack

| Layer        | Technology                                                                 |
|--------------|----------------------------------------------------------------------------|
| Frontend     | React 18, Vite, TailwindCSS, Redux Toolkit, Dexie (IndexedDB)              |
| Backend      | FastAPI (Python), Uvicorn, Firebase Admin SDK                              |
| Database     | Firebase Firestore (real‑time + offline sync)                              |
| Auth         | Firebase Auth (email/password)                                             |
| Notifications| Email via Gmail SMTP (or mock when offline)                                |
| Maps (soon)  | Leaflet + OpenStreetMap (free, no API key)                                 |
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

Enable Authentication → Email/Password

Enable Firestore Database in test mode

Generate a service account private key (Project Settings → Service accounts → Generate new private key)

Save the JSON as backend/firebase-admin-sdk.json

Copy the web app config (Project Settings → General → Your apps) and paste into frontend/src/firebase.js

4. Frontend setup
bash
cd ../frontend
npm install
npm run dev
5. Run the backend
bash
cd ../backend
uvicorn app.main:app --reload --port 8000
Open http://localhost:5173 – sign up as farmer, driver, or buyer.

📁 Project Structure
text
zim-agrichain-prototype/
├── backend/
│   ├── app/
│   │   ├── routes/          # API endpoints (listings, bids, transactions)
│   │   ├── services/        # email_client.py, twilio_client.py (mock)
│   │   ├── auth_deps.py     # Firebase token verification
│   │   ├── firebase_config.py
│   │   ├── main.py
│   │   └── models.py
│   ├── requirements.txt
│   └── firebase-admin-sdk.json (gitignored)
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/      # FarmerDashboard, DriverDashboard, Login, Signup
│   │   ├── store/           # Redux + offline sync (IndexedDB)
│   │   ├── App.jsx
│   │   ├── firebase.js
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── scripts/                 # seed_firestore.py, simulate_twilio.py
├── .gitignore
└── README.md
🧪 Testing the Flow
Farmer signs up → posts a listing (crop, quantity, price, pickup & destination)
Driver signs up (different email) → sees active listings → places a bid
Farmer sees bid under “My Listings & Bids” → clicks “Accept”
Driver receives email notification (mock or real) and sees bid status “accepted”
Both can view the transaction history (coming soon)

📧 Email Notifications
If you do not set up EMAIL_ADDRESS/EMAIL_PASSWORD, the backend prints MOCK EMAIL to the terminal.
To enable real emails, create a Gmail App Password (Google Account → Security → App Passwords) and add to .env.

🗺️ Coming Soon (Next Features)
Live maps (driver location sharing, nearby listings)
Order history for all roles
EcoCash / Paynow escrow payments
Driver reputation & reviews
Shona / Ndebele language support
Offline voice input for illiterate users

🤝 Contributing
Pull requests are welcome. For major changes, please open an issue first.
Contact: [your email] or open a GitHub issue.

📄 License
MIT

🙏 Acknowledgements
Firebase for backend & real‑time database
FastAPI for the API framework
Leaflet & OpenStreetMap for upcoming maps
All Zimbabwean farmers, drivers, and buyers who inspired this solution