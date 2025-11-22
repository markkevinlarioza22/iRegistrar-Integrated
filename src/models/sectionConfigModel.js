const mongoose = require('mongoose');

const sectionConfigSchema = new mongoose.Schema(
  {
    specialization: { type: String, required: true },
    section_name: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SectionConfig', sectionConfigSchema);
