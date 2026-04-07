const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./src/routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files (same level as server.js)
app.use(express.static(path.join(__dirname, 'Frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Use API routes
app.use('/api', apiRoutes);

// Any unresolved route, send to index.html (SPA logic)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'Frontend', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ SLPCT Server is running on http://localhost:${PORT}`);
});
