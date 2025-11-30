const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Sales', 'Users', 'Products', 'Inventory'],
    required: true
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Admin who generated it
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Generated', 'Failed'],
    default: 'Pending'
  },
  data: {
    type: Object, // Store the calculated JSON data here
    default: {}
  },
  fileUrl: {
    type: String, // If you were generating actual PDFs/CSVs
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Report', reportSchema);