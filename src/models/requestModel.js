const mongoose = require('mongoose');

const DOCUMENT_TYPES = [
  'Transcript of Records',
  'Certificate of Enrollment',
  'Good Moral Certificate'
];

const STATUS_TYPES = [
  'Pending',
  'Approved',
  'Processing',
  'Released',
  'Rejected'
];

const requestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  documentType: {
    type: String,
    required: true,
    enum: DOCUMENT_TYPES
  },
  purpose: {
    type: String,
    required: true
  },
  remarks: {
    type: String
  },
  status: {
    type: String,
    default: 'Pending',
    enum: STATUS_TYPES
  }
}, { timestamps: true });

const Request = mongoose.model('Request', requestSchema);
module.exports = Request;
