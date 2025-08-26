const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {

  console.log("DEBUG keys:", Object.keys(process.env).filter(k => k.startsWith("FIREBASE")));
  console.log("DEBUG FIREBASE_SERVICE_ACCOUNT_BASE64 length:", process.env.FIREBASE_SERVICE_ACCOUNT_BASE64?.length);
  console.log("DEBUG FIREBASE_SERVICE_ACCOUNT present:", !!process.env.FIREBASE_SERVICE_ACCOUNT);

  // Preferred: base64 encoded JSON (safe for env var single-line)
  try {
    const json = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
    serviceAccount = JSON.parse(json);
  } catch (err) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_BASE64:', err);
    process.exit(1);
  }
} else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Optional: full JSON pasted into env var
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (err) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT:', err);
    process.exit(1);
  }
} else {
  // Local dev fallback: only use file if exists (and it's gitignored)
  const localPath = path.join(__dirname, 'firebase-service-account.json');
  if (fs.existsSync(localPath)) {
    serviceAccount = require(localPath);
  } else {
    console.error('Missing Firebase service account. Provide FIREBASE_SERVICE_ACCOUNT_BASE64 or FIREBASE_SERVICE_ACCOUNT env var, or place firebase-service-account.json (local dev).');
    process.exit(1);
  }
}

// normalize private key newlines if needed
if (serviceAccount.private_key && serviceAccount.private_key.includes('\\n')) {
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
}

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: serviceAccount.project_id || serviceAccount.projectId,
    clientEmail: serviceAccount.client_email || serviceAccount.clientEmail,
    privateKey: serviceAccount.private_key || serviceAccount.privateKey,
  }),
});

module.exports = admin;
