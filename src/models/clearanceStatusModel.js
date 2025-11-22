const mongoose = require('mongoose');

const clearanceStatusSchema = new mongoose.Schema(
  {
    student_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    instructor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Instructor', required: true },
    status: { type: String, enum: ['Pending', 'Cleared'], default: 'Pending' },
  },
  { timestamps: true }
);

clearanceStatusSchema.index(
  { student_user_id: 1, instructor_id: 1 },
  { unique: true }
);

module.exports = mongoose.model('ClearanceStatus', clearanceStatusSchema);
