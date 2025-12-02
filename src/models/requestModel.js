const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);
