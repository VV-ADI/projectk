import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Search as SearchIcon, Ban, Car, Users, Clock, UserCircle, Star, ArrowRight } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import mapboxgl from 'mapbox-gl';
import "mapbox-gl/dist/mapbox-gl.css";
import axios from 'axios';

const MAPBOX_TOKEN = "pk.eyJ1IjoieWFzd2FudGgyMDA3IiwiYSI6ImNtOHp2Y2pmcTA4ZjUyc3E3bG9qd3QzN2EifQ.-o4c1vzZup3s8JMYdBtvxw";
mapboxgl.accessToken = MAPBOX_TOKEN;

const Search = ({ publishedRides = [] }) => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rides, setRides] = useState([]);
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [mapLoading, setMapLoading] = useState(true);
  const [activeInput, setActiveInput] = useState(null);
  const [genderPreference, setGenderPreference] = useState("any");
  const [isLocationLoading, setIsLocationLoading] = useState(false);

  const mapContainer = useRef(null);

  useEffect(() => {
    if (!mapContainer.current) return;
    const map = new mapboxgl.Map({
  container: mapContainer.current,
  style: "mapbox://styles/mapbox/dark-v11", // dark theme
  center: [80.6480, 16.5062], // Vijayawada
  zoom: 11,
});
    return () => map.remove();
  }, []);
  
  const fetchSuggestions = async (query, setSuggestions) => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json`,
        {
          params: {
            access_token: MAPBOX_TOKEN,
            autocomplete: true,
            types: "place,postcode,address",
          },
        }
      );
      setSuggestions(response.data.features);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/rides", {
        params: {
          from,
          to,
          date: date ? date.toISOString() : undefined,
          genderPreference,
        },
      });
      setRides(response.data.rides || []);
    } catch (error) {
      setRides([]);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await axios.get(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json`,
            {
              params: {
                access_token: MAPBOX_TOKEN,
              },
            }
          );

          if (response.data.features.length > 0) {
            setFrom(response.data.features[0].place_name);
          }
        } catch (error) {
          console.error("Error getting current location:", error);
        } finally {
          setIsLocationLoading(false);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Unable to retrieve your location.");
        setIsLocationLoading(false);
      }
    );
  };

  const formatTime = (time) => {
    return `${time.hour}:${time.minute} ${time.ampm}`;
  };

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/rides");
        setRides(response.data.rides || []);
      } catch (error) {
        setRides([]);
      }
    };
    fetchRides();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-40">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12 text-center"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
          Find Your Perfect Ride
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Discover convenient and affordable rides with friendly drivers heading your way
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800/40 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-700/50 overflow-hidden"
          >
            <div className="p-6 space-y-6">
              <div className="relative">
                <label className="flex items-center text-gray-300 text-sm font-medium mb-2">
                  <MapPin size={16} className="mr-1.5 text-blue-400" />
                  From
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className={`w-full p-4 bg-gray-700/50 border ${
                      activeInput === 'from' ? 'border-blue-500' : 'border-gray-600'
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 text-white placeholder-gray-400`}
                    placeholder="Enter departure location"
                    value={from}
                    onChange={(e) => {
                      setFrom(e.target.value);
                      fetchSuggestions(e.target.value, setFromSuggestions);
                    }}
                    onFocus={() => setActiveInput('from')}
                    onBlur={() => setTimeout(() => setActiveInput(null), 200)}
                  />
                  <button
                    className={`absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-300 transition-colors duration-300 ${
                      isLocationLoading ? 'animate-pulse' : ''
                    }`}
                    onClick={getCurrentLocation}
                    disabled={isLocationLoading}
                  >
                    <MapPin size={20} />
                  </button>
                </div>

                <AnimatePresence>
                  {fromSuggestions.length > 0 && activeInput === 'from' && (
                    <motion.ul
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-10 w-full bg-gray-800 border border-gray-600 rounded-xl mt-2 max-h-60 overflow-auto custom-scrollbar"
                    >
                      {fromSuggestions.map((place) => (
                        <motion.li
                          key={place.id}
                          whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}
                          className="p-3 cursor-pointer hover:bg-blue-500/10 transition-colors duration-200 text-gray-200"
                          onClick={() => {
                            setFrom(place.place_name);
                            setFromSuggestions([]);
                          }}
                        >
                          {place.place_name}
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative">
                <label className="flex items-center text-gray-300 text-sm font-medium mb-2">
                  <MapPin size={16} className="mr-1.5 text-purple-400" />
                  To
                </label>
                <input
                  type="text"
                  className={`w-full p-4 bg-gray-700/50 border ${
                    activeInput === 'to' ? 'border-purple-500' : 'border-gray-600'
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 text-white placeholder-gray-400`}
                  placeholder="Enter destination"
                  value={to}
                  onChange={(e) => {
                    setTo(e.target.value);
                    fetchSuggestions(e.target.value, setToSuggestions);
                  }}
                  onFocus={() => setActiveInput('to')}
                  onBlur={() => setTimeout(() => setActiveInput(null), 200)}
                />

                <AnimatePresence>
                  {toSuggestions.length > 0 && activeInput === 'to' && (
                    <motion.ul
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-10 w-full bg-gray-800 border border-gray-600 rounded-xl mt-2 max-h-60 overflow-auto custom-scrollbar"
                    >
                      {toSuggestions.map((place) => (
                        <motion.li
                          key={place.id}
                          whileHover={{ backgroundColor: "rgba(168, 85, 247, 0.1)" }}
                          className="p-3 cursor-pointer hover:bg-purple-500/10 transition-colors duration-200 text-gray-200"
                          onClick={() => {
                            setTo(place.place_name);
                            setToSuggestions([]);
                          }}
                        >
                          {place.place_name}
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative">
                <label className="flex items-center text-gray-300 text-sm font-medium mb-2">
                  <Calendar size={16} className="mr-1.5 text-indigo-400" />
                  Date
                </label>
                <div className="relative">
                  <DatePicker
                    selected={date}
                    onChange={(newDate) => setDate(newDate)}
                    dateFormat="dd/MM/yyyy"
                    minDate={new Date()}
                    placeholderText="Select travel date"
                    className={`w-full p-4 bg-gray-700/50 border ${
                      activeInput === 'date' ? 'border-indigo-500' : 'border-gray-600'
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 text-white placeholder-gray-400`}
                    onFocus={() => setActiveInput('date')}
                    onBlur={() => setActiveInput(null)}
                    wrapperClassName="w-full"
                  />
                  <Calendar
                    size={20}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="flex items-center text-gray-300 text-sm font-medium mb-2">
                  <UserCircle size={16} className="mr-1.5 text-blue-400" />
                  Gender Preference
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['any', 'male', 'female'].map((gender) => (
                    <button
                      key={gender}
                      className={`p-3 rounded-lg border transition-all duration-300 ${
                        genderPreference === gender
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 border-blue-500 text-white shadow-md shadow-blue-500/20'
                          : 'border-gray-600 text-gray-300 hover:border-blue-500/50 hover:bg-blue-500/5'
                      }`}
                      onClick={() => setGenderPreference(gender)}
                    >
                      {gender.charAt(0).toUpperCase() + gender.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSearch}
                className={`w-full flex items-center justify-center p-4 rounded-xl font-semibold transition duration-300 shadow-lg ${
                  from && to && date
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white shadow-blue-500/20'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
                disabled={!from || !to || !date || loading}
              >
                {loading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    <SearchIcon size={20} className="mr-2" />
                    <span>Search Rides</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>

        <div
  className="lg:col-span-2 bg-gray-900 rounded-2xl p-6"
  style={{ opacity: 1 }}
>
  <div ref={mapContainer} id="map" className="h-80 w-full rounded-2xl overflow-hidden shadow-2xl border border-gray-700/50 mb-8" />

  <h2 className="text-2xl font-bold mb-4 text-white">Available Rides</h2>
  <div
    className="max-h-[420px] overflow-y-auto pr-2 custom-scrollbar"
    style={{ scrollbarWidth: "thin", scrollbarColor: "#6366f1 #1f2937" }}
  >
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 1 }}
          className="flex justify-center py-12"
        >
          <div className="relative w-20 h-20">
            <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-t-blue-500 border-r-transparent border-b-indigo-500 border-l-transparent animate-spin"></div>
            <div className="absolute top-2 left-2 w-16 h-16 rounded-full border-4 border-t-transparent border-r-purple-500 border-b-transparent border-l-blue-400 animate-spin-slow"></div>
          </div>
        </motion.div>
      ) : rides.length > 0 ? (
        <motion.div>
          {rides.map((ride) => (
            <motion.div
              key={ride._id}
              className="bg-gray-900 rounded-xl p-6 mb-4 shadow-lg border border-blue-600 flex flex-col md:flex-row justify-between items-center"
              initial={{ opacity: 1, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 1, y: 20 }}
              style={{ opacity: 1 }}
            >
              <div>
                <div className="text-xl font-bold text-blue-400">
                  {ride.from} <ArrowRight className="inline mx-2" /> {ride.to}
                </div>
                <div className="text-white mt-1">
                  <span>Date: {ride.date ? new Date(ride.date).toLocaleDateString() : "N/A"}</span>
                  <span className="ml-4">Time: {ride.time ? `${ride.time.hour}:${ride.time.minute} ${ride.time.ampm}` : "N/A"}</span>
                  <span className="ml-4">Seats: {ride.seats}</span>
                </div>
                <div className="text-blue-200 mt-1">
                  Gender Preference: {ride.genderPreference || "Any"}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 1, scale: 0.9 }}
          className="bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-700/50 p-8 text-center"
        >
          <Ban size={60} className="text-red-500/80 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">No Rides Available</h3>
          <p className="text-gray-400">Try different locations or dates</p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
</div>
      </div>
    </div>
  );
};

export default Search;