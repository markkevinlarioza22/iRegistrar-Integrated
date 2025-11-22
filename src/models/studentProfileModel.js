const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    student_id: { type: String, required: true, unique: true },
    course: { type: String },
    contact_number: { type: String },
    school_year: { type: String },
    specialization: { type: String },
    section: { type: String },
    is_profile_complete: { type: Boolean, default: false },
    profile_image_url: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
