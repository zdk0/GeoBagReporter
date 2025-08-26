const admin = require('firebase-admin');

let creds;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // The env var should contain the full JSON string
  creds = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  // Local dev fallback (file is .gitignored)
  creds = require('./firebase-service-account.json');
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: creds.project_id || creds.projectId,
      clientEmail: creds.client_email || creds.clientEmail,
      privateKey: (creds.private_key || creds.privateKey).replace(/\\n/g, '\n'),
    }),
  });
}

module.exports = admin;
