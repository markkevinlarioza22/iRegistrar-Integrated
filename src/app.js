const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./db/index'); // DB connection

// Import routes
const userRoutes = require('./routes/userRoutes');
const requestRoutes = require('./routes/requestRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes);

// Default route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

module.exports = app;
