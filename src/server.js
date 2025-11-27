// ========================================
// server.js – Starts the Server
// ========================================

require('dotenv').config();
const app = require('./app');    // <-- Import the configured Express app

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
