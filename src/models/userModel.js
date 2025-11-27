const mongoose = require('mongoose');

// Define the user schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student'
    }
  },
  { timestamps: true }
);

// Export the model and explicitly use 'users' collection
const User = mongoose.model('User', userSchema, 'users'); // <-- third param is collection
module.exports = User;
