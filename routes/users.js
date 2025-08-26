const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyFirebaseToken = require('../middleware/auth');

// POST /api/users/register
router.post('/register', async (req, res) => {
  const { firebase_uid, name, email, phone, role } = req.body;
  if (!firebase_uid || !name || !email || !phone) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const existing = await db.oneOrNone(
      'SELECT id FROM users WHERE firebase_uid = $1 OR email = $2',
      [firebase_uid, email]
    );
    if (existing) return res.status(409).json({ error: 'User already exists' });

    await db.none(
      `INSERT INTO users (firebase_uid, name, email, phone, role)
       VALUES ($1, $2, $3, $4, $5)`,
      [firebase_uid, name, email, phone, role || 'reporter']
    );
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/users/by-uid/:uid  (public for now; can protect later)
router.get('/by-uid/:uid', async (req, res) => {
  try {
    const user = await db.oneOrNone('SELECT * FROM users WHERE firebase_uid = $1', [req.params.uid]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/users/me  (protected)
router.get('/me', verifyFirebaseToken, async (req, res) => {
  try {
    const me = await db.oneOrNone('SELECT * FROM users WHERE firebase_uid = $1', [req.user.uid]);
    if (!me) return res.status(404).json({ error: 'User not found' });
    res.json(me);
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
