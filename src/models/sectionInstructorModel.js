const mongoose = require('mongoose');

const sectionInstructorSchema = new mongoose.Schema(
  {
    section_config_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SectionConfig',
      required: true,
    },
    instructor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Instructor',
      required: true,
    },
  },
  { timestamps: true }
);

sectionInstructorSchema.index(
  { section_config_id: 1, instructor_id: 1 },
  { unique: true }
);

module.exports = mongoose.model('SectionInstructor', sectionInstructorSchema);
