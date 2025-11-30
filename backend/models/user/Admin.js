const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [/^\+?[\d\s\-()]{10,}$/, 'Please enter a valid phone number']
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  profilePhoto: {
    type: String, // URL to image
    default: null
  },
}, {
  timestamps: true
});

// Virtual for full name
adminSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
adminSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Admin', adminSchema);