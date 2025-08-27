const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

async function submitReport(req, res) {
  const {
    user_id,
    damage_type,
    severity,
    description,
    photo_urls,
    latitude,
    longitude,
  } = req.body;

  if (!user_id || !damage_type || !severity || !photo_urls || !latitude || !longitude) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const report_id = `GEO-${new Date().toISOString().slice(0, 10)}-${uuidv4().slice(0, 8)}`;

  try {
    
      const result = await pool.query(
      `INSERT INTO reports 
        (report_id, user_id, damage_type, severity, description, photo_urls, latitude, longitude)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [report_id, user_id, damage_type, severity, description, photo_urls, latitude, longitude]
    );

    res.status(201).json({ report: result.rows[0] });
  } catch (err) {
    console.error('Submit error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function getUserReports(req, res) {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM reports WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json({ reports: result.rows });
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { submitReport, getUserReports };
