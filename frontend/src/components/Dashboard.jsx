import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import ItineraryList from './ItineraryList';
import ConfirmModal from './ConfirmModal';
import { useToast } from '../context/ToastContext';

const Dashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [title, setTitle] = useState('');
  const [generating, setGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  const [loading, setLoading] = useState(true);
  const showToast = useToast();

  // Fetch bookings on load
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get('https://travel-itinerary-ai-1l2j.onrender.com/api/upload');
        setBookings(res.data);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        showToast('Failed to load bookings', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [showToast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf']
    },
    onDrop: async (acceptedFiles) => {
      setUploading(true);
      showToast(`Uploading ${acceptedFiles.length} file(s)...`, 'info');
      try {
        for (const file of acceptedFiles) {
          const formData = new FormData();
          formData.append('document', file);
          const res = await axios.post('https://travel-itinerary-ai-1l2j.onrender.com/api/upload', formData);
          setBookings(prev => [...prev, res.data]);
        }
        showToast('File(s) uploaded successfully!', 'success');
      } catch (err) {
        console.error('Error uploading:', err);
        showToast('Failed to upload file(s)', 'error');
      } finally {
        setUploading(false);
      }
    }
  });

  const handleDelete = async (id) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`https://travel-itinerary-ai-1l2j.onrender.com/api/upload/${deleteConfirm.id}`);
      setBookings(prev => prev.filter(b => b._id !== deleteConfirm.id));
      setSelectedBookings(prev => prev.filter(b => b !== deleteConfirm.id));
      showToast('Booking deleted!', 'success');
    } catch (err) {
      console.error('Error deleting booking:', err);
      showToast('Failed to delete booking', 'error');
    } finally {
      setDeleteConfirm({ isOpen: false, id: null });
    }
  };

  const handleGenerate = async () => {
    if (selectedBookings.length === 0) {
      showToast('Please select at least one booking', 'info');
      return;
    }
    setGenerating(true);
    showToast('Generating your itinerary...', 'info');
    try {
      const res = await axios.post('https://travel-itinerary-ai-1l2j.onrender.com/api/itineraries/generate', {
        bookingIds: selectedBookings,
        title
      });
      showToast('Itinerary created!', 'success');
      window.location.href = `/itinerary/${res.data._id}`;
    } catch (err) {
      console.error('Error generating itinerary:', err);
      showToast('Failed to generate itinerary', 'error');
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

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: null })}
        title="Delete Booking?"
        message="Are you sure you want to delete this booking? This action cannot be undone."
      />
    </div>
  );
};

export default Dashboard;
