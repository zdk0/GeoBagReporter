const admin = require('../firebaseAdmin');
const db = require('../db');

async function loginUser(req, res) {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ error: 'Missing Firebase ID token' });
  }

  try {
    // ✅ Verify Firebase token
    const decoded = await admin.auth().verifyIdToken(idToken);
    const firebase_uid = decoded.uid;

    // ✅ Get user from DB
    const user = await db.oneOrNone('SELECT * FROM users WHERE firebase_uid = $1', [firebase_uid]);

    if (!user) {
      return res.status(404).json({ error: 'User not found in DB' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Invalid or expired token' });
  }
}

module.exports = {
  loginUser,
};
