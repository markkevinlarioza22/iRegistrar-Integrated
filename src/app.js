const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./db/index');

const userRoutes = require('./routes/userRoutes');
const requestRoutes = require('./routes/requestRoutes');

const app = express();

// Connect DB
connectDB();

// CORS fix
app.use(cors({
  origin: [
    "http://localhost:5500",
    "http://localhost:3000",
    "http://127.0.0.1:5500",
    "https://iregistrar-integrated.onrender.com",
  ],
  credentials: true,
}));

app.use(express.json());

// Serve frontend
const publicPath = path.join(__dirname, '..', 'public');
console.log("Serving static from:", publicPath);
app.use(express.static(publicPath));

// Backend API
app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes);

// SAFE catch-all route for Render + Node 22
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(publicPath, 'login.html'));
});

module.exports = app;
