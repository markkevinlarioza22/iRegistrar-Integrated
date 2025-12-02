const mongoose = require('mongoose');
const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB Atlas
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("✅ MongoDB Connected Successfully");
})
.catch((err) => {
    console.error("❌ MongoDB Connection Failed:", err);
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
