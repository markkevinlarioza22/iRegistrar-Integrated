const mongoose = require('mongoose');

const instructorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    position: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Instructor', instructorSchema);

