require('dotenv').config();

const express = require('express');
const cors = require('cors');

const userRoutes = require('./routes/users');
const reportRoutes = require('./routes/reports');

const app = express();

app.use(cors()); // TODO: restrict origin for production
app.use(express.json({ limit: '5mb' }));

app.get('/', (_req, res) => res.send('GeoBag API is running'));
app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
