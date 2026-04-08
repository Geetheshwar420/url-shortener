import express from 'express';
import cors from 'cors';
import { nanoid } from 'nanoid';
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const app = express();

// Standard CORS configuration
// In production, you would set this to your Firebase Hosting domain
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*',
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// Firebase Admin Initialization
const initializeFirebase = () => {
  if (admin.apps.length > 0) return admin.app();

  let serviceAccount;
  
  // 1. Check for full JSON in env (Vercel Production)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } 
  // 2. Check for local path (Local Development)
  else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    serviceAccount = JSON.parse(fs.readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8'));
  }

  if (serviceAccount) {
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } else {
    // Automatic environment detection (if running on GCF/Firebase)
    return admin.initializeApp();
  }
};

initializeFirebase();
const db = admin.firestore();
const urlsCol = db.collection('urls');

// Endpoint: Generate short URL
app.post('/api/shorten', async (req, res) => {
  const { longUrl } = req.body;
  if (!longUrl) return res.status(400).json({ error: 'URL is required' });

  try {
    const shortCode = nanoid(6);
    const docRef = urlsCol.doc(shortCode);
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Default 7 days expiry

    await docRef.set({
      originalUrl: longUrl,
      shortCode,
      clicks: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: admin.firestore.Timestamp.fromDate(expiresAt)
    });

    // We return the shortCode; full URL construction happens on client or via env
    res.json({ 
      shortCode, 
      originalUrl: longUrl,
      clicks: 0
    });
  } catch (error) {
    console.error('Error shortening URL:', error);
    res.status(500).json({ error: 'Failed to shorten URL' });
  }
});

// Endpoint: Fetch history
app.get('/api/links', async (req, res) => {
  try {
    const snapshot = await urlsCol.orderBy('createdAt', 'desc').limit(20).get();
    const links = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      expiresAt: doc.data().expiresAt?.toDate() || null
    }));
    res.json(links);
  } catch (error) {
    console.error('Error fetching links:', error);
    res.status(500).json({ error: 'Failed to fetch links' });
  }
});

// The Redirector
app.get('/:shortCode', async (req, res) => {
  const { shortCode } = req.params;
  
  // Ignore favicon requests
  if (shortCode === 'favicon.ico') return res.status(204).end();

  try {
    const docRef = urlsCol.doc(shortCode);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).send('<h1>404 - Link not found</h1>');
    }

    const { originalUrl, expiresAt } = doc.data();

    // Check for expiry
    if (expiresAt && expiresAt.toDate() < new Date()) {
      return res.status(410).send(`
        <div style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h1 style="color: #ef4444;">Link Expired</h1>
          <p style="color: #64748b;">This link was set to expire after 7 days and is no longer available.</p>
          <a href="/" style="color: #06b6d4; text-decoration: none;">Create a new link</a>
        </div>
      `);
    }

    // Increment clicks asynchronously (don't block the redirect)
    docRef.update({
      clicks: admin.firestore.FieldValue.increment(1)
    }).catch(err => console.error('Click tracking error:', err));

    res.redirect(originalUrl);
  } catch (error) {
    console.error('Redirect error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// For Vercel, we export the app
// For local development, we listen on a port
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 Backend running at http://localhost:${PORT}`);
  });
}

export default app;
