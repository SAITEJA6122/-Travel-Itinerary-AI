const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['flight', 'hotel', 'travel', 'other'],
    default: 'other'
  },
  fileName: String,
  filePath: String,
  extractedData: Object
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', BookingSchema);
