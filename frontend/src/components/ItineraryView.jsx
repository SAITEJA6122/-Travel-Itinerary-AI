import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ItineraryView = () => {
  const { id } = useParams();
  const [itinerary, setItinerary] = useState(null);

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/itineraries/${id}`);
        setItinerary(res.data);
      } catch (err) {
        console.error('Error fetching itinerary:', err);
      }
    };
    fetchItinerary();
  }, [id]);

  if (!itinerary) return <div className="loading">Loading itinerary... ⏳</div>;

  const shareUrl = `${window.location.origin}/shared/${itinerary.shareId}`;

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    alert('Share link copied to clipboard! 📋');
  };

  const exportAsText = () => {
    let text = `# ${itinerary.title}\n\n`;
    if (itinerary.content.days) {
      itinerary.content.days.forEach((day) => {
        text += `## ${day.date}\n`;
        if (day.activities) {
          day.activities.forEach(activity => {
            text += `- ${activity}\n`;
          });
        }
        if (day.notes) {
          text += `\nNotes: ${day.notes}\n`;
        }
        text += '\n';
      });
    }
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${itinerary.title.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsJSON = () => {
    const blob = new Blob([JSON.stringify(itinerary, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${itinerary.title.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="itinerary-view">
      <div className="itinerary-view-content">
        <h1>{itinerary.title} ✈️</h1>
        
        <div className="share-section">
          <button onClick={copyShareLink} className="btn-success">
            📤 Share Itinerary
          </button>
          <button onClick={exportAsText} className="btn-primary" style={{ background: '#667eea' }}>
            📄 Export TXT
          </button>
          <button onClick={exportAsJSON} className="btn-primary" style={{ background: '#48bb78' }}>
            📋 Export JSON
          </button>
          <div className="share-link">
            {shareUrl}
          </div>
        </div>

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

export default ItineraryView;
