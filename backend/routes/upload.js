const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdf = require('pdf-parse');
const axios = require('axios');
const { protect } = require('../middleware/auth');
const Booking = require('../models/Booking');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const extractWithRetry = async (requestFn, maxRetries = 5, initialDelay = 1000) => {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      if (error.response && error.response.status === 429) {
        // Check if it's an insufficient quota error - don't retry those
        if (error.response.data?.error?.code === 'insufficient_quota') {
          console.error('OpenAI quota exceeded. Please check your plan and billing details.');
          throw error;
        }
        const retryAfter = error.response.headers['retry-after'] ? parseInt(error.response.headers['retry-after']) * 1000 : null;
        const delayMs = retryAfter || initialDelay * Math.pow(2, i);
        console.log(`Rate limited, retrying in ${delayMs}ms (attempt ${i + 1}/${maxRetries})`);
        await delay(delayMs);
      } else {
        throw error;
      }
    }
  }
  throw lastError;
};

const encodeImageToBase64 = (filePath) => {
  const fileBuffer = fs.readFileSync(filePath);
  return fileBuffer.toString('base64');
};

const getImageMimeType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.webp') return 'image/webp';
  return 'image/jpeg';
};

// Get all bookings for a user
router.get('/', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete a booking
router.delete('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Delete file if it exists
    if (booking.filePath && fs.existsSync(booking.filePath)) {
      fs.unlinkSync(booking.filePath);
    }

    await Booking.deleteOne({ _id: req.params.id });
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, upload.single('document'), async (req, res) => {
  try {
    let extractedData = {};
    let extractedText = '';

    try {
      if (req.file.mimetype === 'application/pdf') {
        const dataBuffer = fs.readFileSync(req.file.path);
        const data = await pdf(dataBuffer);
        extractedText = data.text;

        if (extractedText && extractedText.length > 0) {
          const response = await extractWithRetry(() =>
            axios.post(
              'https://api.openai.com/v1/chat/completions',
              {
                model: 'gpt-3.5-turbo',
                messages: [
                  {
                    role: 'system',
                    content: 'Extract travel booking information from the text. Return ONLY valid JSON with: type (flight/hotel/travel/other), departure, arrival, dates, location, hotelName, confirmationNumber, travelers, and any other relevant details. Do not include any markdown formatting or extra text.'
                  },
                  {
                    role: 'user',
                    content: extractedText
                  }
                ],
                temperature: 0.7,
                response_format: { type: 'json_object' }
              },
              {
                headers: {
                  'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                  'Content-Type': 'application/json'
                }
              }
            )
          );

          const aiResponse = response.data.choices[0].message.content;
          extractedData = JSON.parse(aiResponse);
        }
      } else {
        const base64Image = encodeImageToBase64(req.file.path);
        const mimeType = getImageMimeType(req.file.path);

        const response = await extractWithRetry(() =>
          axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
              model: 'gpt-4o',
              messages: [
                {
                  role: 'system',
                  content: 'Extract travel booking information from the image. Return ONLY valid JSON with: type (flight/hotel/travel/other), departure, arrival, dates, location, hotelName, confirmationNumber, travelers, and any other relevant details. Do not include any markdown formatting or extra text.'
                },
                {
                  role: 'user',
                  content: [
                    {
                      type: 'image_url',
                      image_url: {
                        url: `data:${mimeType};base64,${base64Image}`
                      }
                    }
                  ]
                }
              ],
              temperature: 0.7,
              response_format: { type: 'json_object' }
            },
            {
              headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
              }
            }
          )
        );

        const aiResponse = response.data.choices[0].message.content;
        extractedData = JSON.parse(aiResponse);
      }
    } catch (aiError) {
      console.error('AI extraction error:', aiError.message || aiError);
      if (aiError.response) {
        console.error('Error status:', aiError.response.status);
        console.error('Error data:', aiError.response.data);
      }
    }

    const booking = await Booking.create({
      user: req.user._id,
      fileName: req.file.originalname,
      filePath: req.file.path,
      extractedData: extractedData,
      type: extractedData.type || 'other'
    });

    res.json(booking);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
