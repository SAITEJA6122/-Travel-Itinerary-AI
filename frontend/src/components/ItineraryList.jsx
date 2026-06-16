import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ItineraryList = () => {
  const [itineraries, setItineraries] = useState([]);

  useEffect(() => {
    const fetchItineraries = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/itineraries');
        setItineraries(res.data);
      } catch (err) {
        console.error('Error fetching itineraries:', err);
      }
    };
    fetchItineraries();
  }, []);

  return (
    <div>
      <h2>Your Itineraries 🗺️</h2>
      {itineraries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
          No itineraries yet. Upload some bookings and create your first one!
        </div>
      ) : (
        itineraries.map(itinerary => (
          <div key={itinerary._id} className="itinerary-card">
            <h3>
              <Link to={`/itinerary/${itinerary._id}`}>
                🗺️ {itinerary.title}
              </Link>
            </h3>
            <p style={{ color: '#888', fontSize: '0.9rem' }}>
              Created on {new Date(itinerary.createdAt).toLocaleDateString()} at {new Date(itinerary.createdAt).toLocaleTimeString()}
            </p>
            {itinerary.content.days && (
              <p style={{ color: '#666', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                📅 {itinerary.content.days.length} day{itinerary.content.days.length > 1 ? 's' : ''} planned
              </p>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ItineraryList;
