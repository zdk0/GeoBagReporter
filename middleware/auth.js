const admin = require('../firebaseAdmin');

module.exports = async function verifyFirebaseToken(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Missing Authorization token' });

    const decoded = await admin.auth().verifyIdToken(token);
    req.user = { uid: decoded.uid };
    return next();
  } catch (err) {
    console.error('verifyIdToken failed:', err);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
