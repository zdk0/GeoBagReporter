const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyFirebaseToken = require('../middleware/auth');

// Protected: submit a report
router.post('/submit', verifyFirebaseToken, async (req, res) => {
  try {
    const {
      damage_type,
      severity,
      description = '',
      photo_urls = [],
      location,
      firebase_uid: uidFromBody // optional for dev; not used if token present
    } = req.body;

    const firebaseUid = (req.user && req.user.uid) || uidFromBody;
    if (!firebaseUid) return res.status(400).json({ error: 'Missing firebase UID' });

    if (!damage_type || !severity || !Array.isArray(photo_urls) || photo_urls.length === 0 || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 1) resolve user id from firebase_uid
    const user = await db.oneOrNone('SELECT id FROM users WHERE firebase_uid = $1', [firebaseUid]);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // 2) generate report id (GEO-YYYY-MM-DD-xxx)
    const now = new Date();
    const dateStr = now.toISOString().slice(0,10); // YYYY-MM-DD
    const countToday = await db.one('SELECT COUNT(*) FROM reports WHERE DATE(created_at) = CURRENT_DATE');
    const nextNum = String(Number(countToday.count) + 1).padStart(3, '0');
    const report_id = `GEO-${dateStr}-${nextNum}`;

    // 3) insert
    await db.none(
      `INSERT INTO reports
       (report_id, user_id, damage_type, severity, description, photo_urls, location)
       VALUES
       ($1, $2, $3, $4, $5, $6::text[],$7, $8)`,
      [
        report_id,
        user.id,
        damage_type,
        severity,
        description,
        photo_urls,
        location.longitude,
        location.latitude,
      ]
    );

    return res.status(201).json({ success: true, report_id });
  } catch (err) {
    console.error('BACKEND ERROR (submit):', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Get recent reports + count for profile
router.get('/mine', verifyFirebaseToken, async (req, res) => {
  try {
    const firebaseUid = req.user.uid;
    const user = await db.oneOrNone('SELECT id FROM users WHERE firebase_uid = $1', [firebaseUid]);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const recent = await db.any(
      `SELECT report_id, damage_type, severity, created_at
       FROM reports
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 5`,
      [user.id]
    );

    const total = await db.one('SELECT COUNT(*) FROM reports WHERE user_id = $1', [user.id]);

    return res.json({ recent, count: Number(total.count) });
  } catch (err) {
    console.error('BACKEND ERROR (mine):', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
