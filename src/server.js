const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./db/index'); // ✅ Explicit path to index.js
const userRoutes = require('./routes/userRoutes');
const requestRoutes = require('./routes/requestRoutes');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Connect to the database
connectDB();

// ✅ Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// ✅ Routes
app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes);

// ✅ Default route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});


// ✅ Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
