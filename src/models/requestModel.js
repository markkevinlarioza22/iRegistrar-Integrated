const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    documentType: String,
    status: { type: String, default: "Pending" }
}, { timestamps: true });

module.exports = mongoose.model("Request", requestSchema);
