import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import ItineraryList from './ItineraryList';

const Dashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [title, setTitle] = useState('');
  const [generating, setGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [uploading, setUploading] = useState(false);

  // Fetch bookings on load
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/bookings');
        setBookings(res.data);
      } catch (err) {
        console.error('Error fetching bookings:', err);
      }
    };
    fetchBookings();
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf']
    },
    onDrop: async (acceptedFiles) => {
      setUploading(true);
      try {
        for (const file of acceptedFiles) {
          const formData = new FormData();
          formData.append('document', file);
          const res = await axios.post('http://localhost:5000/api/upload', formData);
          setBookings(prev => [...prev, res.data]);
        }
      } catch (err) {
        console.error('Error uploading:', err);
      } finally {
        setUploading(false);
      }
    }
  });

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) {
      return;
    }
    try {
      await axios.delete(`http://localhost:5000/api/bookings/${id}`);
      setBookings(prev => prev.filter(b => b._id !== id));
      setSelectedBookings(prev => prev.filter(b => b !== id));
    } catch (err) {
      console.error('Error deleting booking:', err);
    }
  };

  const handleGenerate = async () => {
    if (selectedBookings.length === 0) return;
    setGenerating(true);
    try {
      const res = await axios.post('http://localhost:5000/api/itineraries/generate', {
        bookingIds: selectedBookings,
        title
      });
      window.location.href = `/itinerary/${res.data._id}`;
    } catch (err) {
      console.error('Error generating itinerary:', err);
    } finally {
      setGenerating(false);
    }
  };

  const toggleBooking = (id) => {
    if (selectedBookings.includes(id)) {
      setSelectedBookings(selectedBookings.filter(b => b !== id));
    } else {
      setSelectedBookings([...selectedBookings, id]);
    }
  };

  // Filter and search bookings
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (booking.extractedData && JSON.stringify(booking.extractedData).toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = filterType === 'all' || booking.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getTypeIcon = (type) => {
    switch(type) {
      case 'flight': return '✈️';
      case 'hotel': return '🏨';
      case 'travel': return '🧳';
      default: return '📄';
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-content">
        <h1>Welcome to Your Travel Dashboard! 🌍</h1>

        {/* Upload Zone */}
        <div 
          {...getRootProps()} 
          className={`upload-zone ${isDragActive ? 'drag-active' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="upload-zone-icon">📁</div>
          {uploading ? (
            <p>Uploading files... ⏳</p>
          ) : isDragActive ? (
            <p>Drop the files here... 📥</p>
          ) : (
            <p>Drag & drop booking PDFs/images here, or click to select multiple files 📄</p>
          )}
        </div>

        {/* Bookings Section */}
        {bookings.length > 0 && (
          <div className="bookings-container">
            <div className="bookings-header">
              <h2>Uploaded Bookings ({bookings.length})</h2>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search bookings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <select
                  className="search-input"
                  style={{ minWidth: 'auto' }}
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="flight">✈️ Flights</option>
                  <option value="hotel">🏨 Hotels</option>
                  <option value="travel">🧳 Travel</option>
                  <option value="other">📄 Other</option>
                </select>
              </div>
            </div>

            {filteredBookings.map(booking => (
              <div 
                key={booking._id} 
                className={`booking-card ${selectedBookings.includes(booking._id) ? 'selected' : ''}`}
              >
                <div className="booking-card-header">
                  <div className="booking-card-left">
                    <input
                      type="checkbox"
                      className="booking-checkbox"
                      checked={selectedBookings.includes(booking._id)}
                      onChange={() => toggleBooking(booking._id)}
                    />
                    <div>
                      <div className="booking-file-name">
                        {getTypeIcon(booking.type)} {booking.fileName}
                      </div>
                      <span className={`booking-type-badge ${booking.type}`}>
                        {booking.type}
                      </span>
                    </div>
                  </div>
                  <div className="booking-actions">
                    <button 
                      className="btn-icon delete"
                      onClick={() => handleDelete(booking._id)}
                      title="Delete booking"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                {booking.extractedData && Object.keys(booking.extractedData).length > 0 && (
                  <div className="booking-details">
                    <pre>{JSON.stringify(booking.extractedData, null, 2)}</pre>
                  </div>
                )}
              </div>
            ))}

            {filteredBookings.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                No bookings match your search.
              </div>
            )}

            {/* Generate Section */}
            {filteredBookings.length > 0 && (
              <div className="generate-section">
                <div className="generate-form">
                  <input
                    type="text"
                    placeholder="Itinerary Title (e.g., Summer Trip to Japan)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <button
                    onClick={handleGenerate}
                    disabled={generating || selectedBookings.length === 0}
                    className="btn-primary"
                  >
                    {generating ? '✨ Generating Itinerary...' : '✨ Generate Itinerary'}
                  </button>
                </div>
                {selectedBookings.length > 0 && (
                  <p style={{ marginTop: '0.75rem', color: '#666' }}>
                    {selectedBookings.length} booking{selectedBookings.length > 1 ? 's' : ''} selected
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Itineraries List */}
        <div className="itineraries-section">
          <ItineraryList />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
