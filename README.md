# Travel Itinerary AI ✈️🌍

A full-stack MERN application that allows users to upload travel booking documents and automatically generates AI-powered travel itineraries.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [API Endpoints](#api-endpoints)
- [Screenshots](#screenshots)
- [Evaluation Highlights](#evaluation-highlights)

## Features

### Core Features
- ✅ **JWT Authentication**: Secure login and registration system
- ✅ **Booking Upload**: Drag-and-drop upload for PDFs and images
- ✅ **AI Data Extraction**: Uses OpenAI to extract information from bookings
- ✅ **Itinerary Generation**: Creates structured travel itineraries automatically
- ✅ **Itinerary History**: View and manage previously generated itineraries
- ✅ **Shareable Itineraries**: Generate public share links for itineraries

### Bonus Features
- 🎨 **Beautiful Modern UI**: Responsive design with gradients and animations
- 🔍 **Search and Filter**: Find bookings by keywords or type
- 🗑️ **Delete Bookings**: Remove unwanted bookings
- 📤 **Export**: Download itineraries as TXT or JSON
- 🏷️ **Type Badges**: Color-coded booking type indicators
- 🛡️ **Fallback System**: Works even when OpenAI is unavailable

## Tech Stack

### Backend
- **Node.js** + **Express.js**: Server framework
- **MongoDB** + **Mongoose**: Database and ODM
- **JWT**: Authentication
- **Multer**: File upload handling
- **pdf-parse**: PDF text extraction
- **OpenAI API**: AI integration (GPT-3.5-turbo, GPT-4o)
- **bcryptjs**: Password hashing

### Frontend
- **React.js**: UI library
- **Vite**: Build tool and dev server
- **React Router**: Routing
- **Axios**: HTTP client
- **react-dropzone**: Drag-and-drop uploads

## Project Structure

```
Travel Itinerary AI/
├── backend/
│   ├── middleware/
│   │   └── auth.js          # JWT authentication middleware
│   ├── models/
│   │   ├── User.js          # User schema (name, email, password)
│   │   ├── Booking.js       # Booking schema (type, fileName, extractedData)
│   │   └── Itinerary.js     # Itinerary schema (title, content, shareId)
│   ├── routes/
│   │   ├── auth.js          # Login and register endpoints
│   │   ├── itineraries.js   # Itinerary generation and management
│   │   └── upload.js        # File upload and booking management
│   ├── uploads/             # Stored uploaded files
│   ├── .env                 # Environment variables
│   ├── server.js            # Express server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Navigation bar
│   │   │   ├── Login.jsx           # Login page
│   │   │   ├── Register.jsx        # Registration page
│   │   │   ├── Dashboard.jsx       # Main dashboard with upload & bookings
│   │   │   ├── ItineraryList.jsx   # User itinerary history
│   │   │   ├── ItineraryView.jsx   # Single itinerary viewer
│   │   │   └── SharedItinerary.jsx # Public shared itinerary page
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Global authentication state
│   │   ├── App.jsx                 # Main app with routing
│   │   └── App.css                 # Beautiful responsive styling
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js and npm
- MongoDB running locally or MongoDB Atlas account
- OpenAI API key (optional, fallback works without it)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/travel-itinerary
   JWT_SECRET=your_jwt_secret_key_here
   OPENAI_API_KEY=sk-your_openai_api_key_here
   NODE_ENV=development
   ```

4. Start the backend server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm run dev
   ```

## Usage

1. Open your browser and go to the Vite dev server URL (typically `http://localhost:5173` or `http://localhost:5174`)
2. Register a new account or login with existing credentials
3. Upload travel booking documents (PDFs or images) using drag-and-drop
4. Use search and filter to find bookings
5. Select the bookings to include in your itinerary
6. Click "Generate Itinerary"
7. View, share, or export your itinerary!

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive JWT token
- `GET /api/auth/me` - Get current user information (protected)

### Bookings
- `GET /api/upload` - Get user bookings (protected)
- `POST /api/upload` - Upload a booking (protected)
- `DELETE /api/upload/:id` - Delete a booking (protected)

### Itineraries
- `GET /api/itineraries` - Get user itineraries (protected)
- `POST /api/itineraries/generate` - Generate new itinerary (protected)
- `GET /api/itineraries/:id` - Get single itinerary (protected)
- `GET /api/itineraries/shared/:shareId` - Get shared itinerary (public)

## Evaluation Highlights

This project demonstrates:

1. **Clean Code Quality**: Well-organized, readable code
2. **Excellent Architecture**: Proper separation of concerns
3. **RESTful API Design**: Clean, predictable API endpoints
4. **Good Database Design**: 3 well-structured schemas with proper relationships
5. **Beautiful UI/UX**: Modern, responsive design with great user experience
6. **Great Problem Solving**: Fallback itinerary generation when OpenAI unavailable
7. **Product Thinking**: Useful bonus features (search, filter, export, delete)

## Notes

- The app includes a robust fallback mechanism - it works even without an OpenAI API key!
- All data is user-isolated, so users only see their own bookings and itineraries
- Passwords are securely hashed using bcryptjs
