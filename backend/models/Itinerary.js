const mongoose = require('mongoose');

const ItinerarySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: Object,
    required: true
  },
  shareId: {
    type: String,
    unique: true,
    required: true
  },
  bookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Itinerary', ItinerarySchema);
