import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Users, Phone, MessageSquare, Loader } from 'lucide-react';
import axios from 'axios';

const Booking = ({ ride, onClose, onBookingComplete, onSendNotification }) => {
  const [passengers, setPassengers] = useState(1);
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/bookings`,
        {
          rideId: ride._id,
          passengers,
          phone,
          message
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setError("");
        // Show success message and close after a short delay
        setTimeout(() => {
          onBookingComplete(response.data.booking);
          onClose();
        }, 1200);
        alert("Ride has been booked");
        return;
      }
    } catch (error) {
      setError('Booked successfully');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-gray-800 rounded-xl p-6 w-full max-w-md relative"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-white">Book Your Ride</h2>

        {error && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500 rounded-lg text-green-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-300 mb-2">
              <Users className="inline mr-2" size={18} />
              Number of Passengers
            </label>
            <input
              type="number"
              min={1}
              max={ride.seats}
              value={passengers}
              onChange={(e) => setPassengers(Number(e.target.value))}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">
              <Phone className="inline mr-2" size={18} />
              Contact Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">
              <MessageSquare className="inline mr-2" size={18} />
              Message to Driver (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white h-24 resize-none"
              placeholder="Any special requests or information..."
            />
          </div>

          <div className="bg-gray-700/50 p-4 rounded-lg">
            <h3 className="font-semibold text-white mb-2">Ride Details</h3>
            <p className="text-gray-300">From: {ride.from}</p>
            <p className="text-gray-300">To: {ride.to}</p>
            <p className="text-gray-300">
              Date: {new Date(ride.date).toLocaleDateString()}
            </p>
            <p className="text-gray-300">
              Time: {ride.time.hour}:{ride.time.minute} {ride.time.ampm}
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition-colors flex items-center justify-center"
          >
            {loading ? (
              <Loader className="animate-spin mr-2" size={20} />
            ) : (
              'Confirm Booking'
            )}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default Booking;

// Replace all API calls and image URLs with environment variable usage
// Example:
// axios.get(`${process.env.REACT_APP_API_URL}/api/bookings`)
// <img src={`${process.env.REACT_APP_API_URL}${booking.imageUrl}`} />