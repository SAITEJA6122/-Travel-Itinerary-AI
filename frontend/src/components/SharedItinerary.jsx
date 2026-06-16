import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const SharedItinerary = () => {
  const { shareId } = useParams();
  const [itinerary, setItinerary] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/itineraries/shared/${shareId}`);
        setItinerary(res.data);
      } catch (err) {
        setError('Itinerary not found');
        console.error('Error fetching shared itinerary:', err);
      }
    };
    fetchItinerary();
  }, [shareId]);

  if (error) {
    return (
      <div className="itinerary-view">
        <div className="itinerary-view-content">
          <h1>❌ Itinerary Not Found</h1>
          <p style={{ color: '#888', textAlign: 'center' }}>
            This shared itinerary link is invalid or no longer exists.
          </p>
        </div>
      </div>
    );
  }

  if (!itinerary) return <div className="loading">Loading itinerary... ⏳</div>;

  return (
    <div className="itinerary-view">
      <div className="itinerary-view-content">
        <h1>{itinerary.title} ✈️</h1>
        <p style={{ color: '#888', marginBottom: '2rem' }}>
          Shared Itinerary • Created on {new Date(itinerary.createdAt).toLocaleDateString()}
        </p>

        {itinerary.content.days && itinerary.content.days.map((day, index) => (
          <div key={index} className="day-card">
            <h3>📅 {day.date}</h3>
            {day.activities && day.activities.length > 0 && (
              <ul>
                {day.activities.map((activity, i) => (
                  <li key={i}>✨ {activity}</li>
                ))}
              </ul>
            )}
            {day.notes && (
              <div className="notes">
                💡 {day.notes}
              </div>
            )}
          </div>
        ))}

        {(!itinerary.content.days || itinerary.content.days.length === 0) && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
            No days planned yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedItinerary;
