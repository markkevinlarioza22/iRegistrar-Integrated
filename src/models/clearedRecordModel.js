const mongoose = require('mongoose');

const clearedRecordSchema = new mongoose.Schema(
  {
    student_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    school_year: { type: String, required: true },
    full_name: { type: String, required: true },
    student_id_num: { type: String, required: true },
    course: { type: String },
    specialization: { type: String },
    section: { type: String },
    clearance_form_details: { type: Object, required: true }, // JSON-like object
    cleared_date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

clearedRecordSchema.index(
  { student_user_id: 1, school_year: 1 },
  { unique: true }
);

module.exports = mongoose.model('ClearedRecord', clearedRecordSchema);
