const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const { protect } = require('../middleware/auth');
const Itinerary = require('../models/Itinerary');
const Booking = require('../models/Booking');

const router = express.Router();

router.post('/generate', protect, async (req, res) => {
  try {
    const { bookingIds, title } = req.body;
    const bookings = await Booking.find({ _id: { $in: bookingIds }, user: req.user._id });

    const allData = bookings.map(b => b.extractedData);
    let aiContent;

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a travel itinerary planner. Generate a detailed, structured travel itinerary based on the booking information. Include daily activities, transportation, accommodations, and useful tips. Return as JSON with days array, each with date, activities, notes.'
            },
            {
              role: 'user',
              content: JSON.stringify(allData)
            }
          ],
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      aiContent = JSON.parse(response.data.choices[0].message.content);
    } catch (openaiError) {
      console.log('OpenAI unavailable, using fallback itinerary generation');
      // Fallback: Generate a basic itinerary manually from booking data
      const days = [];
      bookings.forEach((booking, index) => {
        const data = booking.extractedData || {};
        days.push({
          date: data.dates || `Day ${index + 1}`,
          activities: [
            `Enjoy your ${booking.type} booking`,
            `${data.hotelName ? `Stay at ${data.hotelName}` : 'Make the most of your trip!'}`,
            `${data.departure ? `Departure from ${data.departure}` : ''}`,
            `${data.arrival ? `Arrival at ${data.arrival}` : ''}`
          ].filter(Boolean),
          notes: `${data.confirmationNumber ? `Confirmation: ${data.confirmationNumber}` : 'Enjoy your trip!'}`
        });
      });
      aiContent = { days: days.length > 0 ? days : [{ date: 'Day 1', activities: ['Enjoy your trip!'], notes: 'Have a great journey!' }] };
    }

    const shareId = crypto.randomBytes(16).toString('hex');

    const itinerary = await Itinerary.create({
      user: req.user._id,
      title: title || 'My Travel Itinerary',
      content: aiContent,
      shareId: shareId,
      bookings: bookingIds
    });

    res.json(itinerary);
  } catch (error) {
    console.error('Error generating itinerary:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all itineraries for a user
router.get('/', protect, async (req, res) => {
  try {
    const itineraries = await Itinerary.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(itineraries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single itinerary by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const itinerary = await Itinerary.findOne({ _id: req.params.id, user: req.user._id });
    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }
    res.json(itinerary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/shared/:shareId', async (req, res) => {
  try {
    const itinerary = await Itinerary.findOne({ shareId: req.params.shareId });
    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }
    res.json(itinerary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
