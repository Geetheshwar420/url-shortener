# Premium URL Shortener

A high-performance, full-stack URL shortener built with React (Vite), Node.js (Express), and Google Cloud Firestore.

## 🚀 Architecture
- **Frontend**: React 19 + Tailwind CSS 4, deployed on **Firebase Hosting**.
- **Backend**: Node.js Express API, deployed on **Vercel**.
- **Database**: Cloud Firestore for persistent link storage and click tracking.

---

## 🛠️ Local Development

### 1. Prerequisites
- Node.js installed.
- A Firebase project with Firestore enabled.
- A Service Account JSON key (found in the root as `url-shortener-3413b-firebase-adminsdk-fbsvc-6f7256407c.json`).

### 2. Setup Backend
```powershell
cd backend
npm install
# Ensure .env exists with:
# PORT=3001
# FIREBASE_SERVICE_ACCOUNT_PATH=../url-shortener-3413b-firebase-adminsdk-fbsvc-6f7256407c.json
# ALLOWED_ORIGIN=http://localhost:5173
npm run dev
```

### 3. Setup Frontend
```powershell
cd frontend
npm install
# Ensure .env exists with:
# VITE_API_URL=http://localhost:3001
npm run dev
```

---

## 🌍 Deployment

### 1. Backend (Vercel)
1. Push your code to GitHub.
2. Import the `backend/` directory to Vercel.
3. Add the following **Environment Variable** in Vercel:
   - `FIREBASE_SERVICE_ACCOUNT`: Copy the ENTIRE content of your Service Account JSON file and paste it here.
4. Deploy.

### 2. Frontend (Firebase Hosting)
1. Install Firebase CLI: `npm install -g firebase-tools`.
2. Login: `firebase login`.
3. Initialize: `firebase init hosting`.
   - Select your project (`url-shortener-3413b`).
   - Public directory: `frontend/dist`.
   - Configure as SPA: `Yes`.
4. Build: `cd frontend; npm run build`.
5. Deploy: `firebase deploy --only hosting`.

---

## 🔒 Security Note
This project uses **Firebase Admin SDK** on the backend to keep database logic and credentials hidden from the client, ensuring your Firestore instance remains secure.
