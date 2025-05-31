import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, MapPin, PlusCircle, CheckCircle, Loader, Car, Users, Clock, UserCircle } from 'lucide-react';

const MAPBOX_TOKEN = "pk.eyJ1IjoieWFzd2FudGgyMDA3IiwiYSI6ImNtOHp2Y2pmcTA4ZjUyc3E3bG9qd3QzN2EifQ.-o4c1vzZup3s8JMYdBtvxw";
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Publish = ({ onRidePublished = () => {} }) => {
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [date, setDate] = useState(null);
    
    const [time, setTime] = useState({
        hour: "1",
        minute: "00",
        ampm: "AM"
    });
    ;

    const [seats, setSeats] = useState(1);
    const [fromSuggestions, setFromSuggestions] = useState([]);
    const [toSuggestions, setToSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [error, setError] = useState(null);
    const [genderPreference, setGenderPreference] = useState("any");

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);
        setError(null);
    
        const token = localStorage.getItem("token");
        if (!token) {
            setError("Please login to publish a ride");
            setLoading(false);
            return;
        }

        // Validate form fields
        if (!from || !to || !date || !time.hour || !time.minute || !time.ampm || !seats) {
            setError("Please fill all fields before publishing.");
            setLoading(false);
            return;
        }
    
        try {
            const rideData = {
                from,
                to,
                date: date?.toISOString(),
                time: {
                    hour: Number(time.hour),      // Convert to number
                    minute: Number(time.minute),  // Convert to number
                    ampm: time.ampm
                },
                seats,
                genderPreference
            };
    
            console.log("Submitting rideData:", rideData);
    
            const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/rides/publish`,
        rideData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
    
            if (response.data.success) {
                setSuccess(true);
                onRidePublished(response.data.ride);
                setTimeout(() => setSuccess(false), 5000);
    
                // Reset form
                setFrom("");
                setTo("");
                setDate(null);
                setTime({ hour: "1", minute: "00", ampm: "AM" });
                setSeats(1);
                setGenderPreference("any");
                setCurrentStep(1);
            }
        } catch (error) {
            if (error.response) {
                // Backend responded with an error
                console.error("Backend error:", error.response.data);
                setError(error.response.data.message || "Failed to publish ride");
            } else if (error.request) {
                // No response from backend
                console.error("No response from backend:", error.request);
                setError("No response from server");
            } else {
                // Other errors
                console.error("Error publishing ride:", error.message);
                setError(error.message || "Failed to publish ride");
            }
        } finally {
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch(currentStep) {
            case 1:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                            <MapPin className="mr-2" /> Route Details
                        </h2>
                        {/* From Location */}
                        <div className="relative">
                            <label className="block text-gray-400 mb-2">From</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    className="w-full p-4 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    placeholder="Enter departure location"
                                    value={from}
                                    onChange={(e) => {
                                        setFrom(e.target.value);
                                        fetchSuggestions(e.target.value, setFromSuggestions);
                                    }}
                                />
                                <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            </div>
                            {fromSuggestions.length > 0 && (
                                <ul className="absolute z-10 w-full bg-gray-800 border border-gray-600 rounded-lg mt-1">
                                    {fromSuggestions.map((place) => (
                                        <li
                                            key={place.id}
                                            className="p-3 cursor-pointer hover:bg-gray-700"
                                            onClick={() => {
                                                setFrom(place.place_name);
                                                setFromSuggestions([]);
                                            }}
                                        >
                                            {place.place_name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* To Location */}
                        <div className="relative">
                            <label className="block text-gray-400 mb-2">To</label>
                            <div className="relative">
                                <input
                                    type="text"
                                
                                    className="w-full p-4 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    placeholder="Enter destination"
                                    value={to}
                                    onChange={(e) => {
                                        setTo(e.target.value);
                                        fetchSuggestions(e.target.value, setToSuggestions);
                                    }}
                                />
                                <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            </div>
                            {toSuggestions.length > 0 && (
                                <ul className="absolute z-10 w-full bg-gray-800 border border-gray-600 rounded-lg mt-1">
                                    {toSuggestions.map((place) => (
                                        <li
                                            key={place.id}
                                            className="p-3 cursor-pointer hover:bg-gray-700"
                                            onClick={() => {
                                                setTo(place.place_name);
                                                setToSuggestions([]);
                                            }}
                                        >
                                            {place.place_name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </motion.div>
                );
            case 2:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                            <Clock className="mr-2" /> Schedule & Preferences
                        </h2>
                        {/* Date & Time */}
                        <div>
                            <label className="block text-gray-400 mb-2">Date & Time</label>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <DatePicker
                                        selected={date}
                                        onChange={(newDate) => setDate(newDate)}
                                        dateFormat="dd/MM/yyyy"
                                        minDate={new Date()}
                                        placeholderText="Pick a date"
                                        className="w-full p-4 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    />
                                </div>
                                <div className="flex-1">
                                    <div className="flex gap-2">
                                        <select
                                            className="p-4 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                            value={time.hour}
                                            onChange={(e) => setTime({ ...time, hour: e.target.value })}
                                        >
                                            {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                                                <option key={hour} value={hour}>
                                                    {hour}
                                                </option>
                                            ))}
                                        </select>

                                        <select
                                            className="p-4 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                            value={time.minute}
                                            onChange={(e) => setTime({ ...time, minute: e.target.value })}
                                        >
                                            {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                                                <option key={minute} value={minute.toString().padStart(2, "0")}>
                                                    {minute.toString().padStart(2, "0")}
                                                </option>
                                            ))}
                                        </select>

                                        <select
                                            className="p-4 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                            value={time.ampm}
                                            onChange={(e) => setTime({ ...time, ampm: e.target.value })}
                                        >
                                            <option value="AM">AM</option>
                                            <option value="PM">PM</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Seats */}
                        <div>
                            <label className="block text-gray-400 mb-2">Available Seats</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="1"
                                    max="8"
                                    className="w-full p-4 text-center text-2xl bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                                    value={seats}
                                    onChange={(e) => setSeats(Math.min(8, Math.max(1, parseInt(e.target.value) || 1)))}
                                />
                                <div className="absolute inset-y-0 right-3 flex flex-col items-center justify-center">
                                    <button
                                        type="button"
                                        className="text-gray-400 hover:text-white transition-all"
                                        onClick={() => setSeats((prev) => Math.min(8, prev + 1))}
                                    >
                                        ▲
                                    </button>
                                    <button
                                        type="button"
                                        className="text-gray-400 hover:text-white transition-all"
                                        onClick={() => setSeats((prev) => Math.max(1, prev - 1))}
                                    >
                                        ▼
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Gender Preference */}
                        <div>
                            <label className=" text-gray-400 mb-2 flex items-center">
                                <UserCircle className="mr-2 text-blue-400" width={20} height={20} />
                                Passenger Gender Preference
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    type="button"
                                    className={`p-3 rounded-lg border transition-all duration-300 ${
                                        genderPreference === 'any'
                                            ? 'bg-blue-600 border-blue-500 text-white'
                                            : 'border-gray-600 hover:border-blue-500/50'
                                    }`}
                                    onClick={() => setGenderPreference('any')}
                                >
                                    Any
                                </button>
                                <button
                                    type="button"
                                    className={`p-3 rounded-lg border transition-all duration-300 ${
                                        genderPreference === 'male'
                                            ? 'bg-blue-600 border-blue-500 text-white'
                                            : 'border-gray-600 hover:border-blue-500/50'
                                    }`}
                                    onClick={() => setGenderPreference('male')}
                                >
                                    Male
                                </button>
                                <button
                                    type="button"
                                    className={`p-3 rounded-lg border transition-all duration-300 ${
                                        genderPreference === 'female'
                                            ? 'bg-blue-600 border-blue-500 text-white'
                                            : 'border-gray-600 hover:border-blue-500/50'
                                    }`}
                                    onClick={() => setGenderPreference('female')}
                                >
                                    Female
                                </button>
                            </div>
                        </div>
                    </motion.div>
                );
            case 3:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                            Review & Publish
                        </h2>
                        <div>
                            <div className="mb-2"><strong>From:</strong> {from}</div>
                            <div className="mb-2"><strong>To:</strong> {to}</div>
                            <div className="mb-2"><strong>Date:</strong> {date ? date.toLocaleDateString() : ""}</div>
                            <div className="mb-2"><strong>Time:</strong> {time.hour}:{time.minute} {time.ampm}</div>
                            <div className="mb-2"><strong>Seats:</strong> {seats}</div>
                            <div className="mb-2"><strong>Gender Preference:</strong> {genderPreference}</div>
                        </div>
                    </motion.div>
                );
            default:
                return null;
        }
    };

    // Generate a unique ride code (similar to username) when publishing
    const [rideCode, setRideCode] = useState("");

    // Generate ride code only once per ride publish
    useEffect(() => {
        if (currentStep === 3 && !rideCode) {
            // Simple code: first 3 letters of 'from' + 3 of 'to' + random 3 digits
            const fromPart = (from || "").replace(/\s/g, "").substring(0, 3).toUpperCase();
            const toPart = (to || "").replace(/\s/g, "").substring(0, 3).toUpperCase();
            const randPart = Math.floor(100 + Math.random() * 900); // 3 digits
            setRideCode(`${fromPart}${toPart}${randPart}`);
        }
        // Reset code if user goes back to step 1
        if (currentStep < 3 && rideCode) setRideCode("");
        // eslint-disable-next-line
    }, [currentStep, from, to]);

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 pb-40">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto w-full"
            >
                <h1 className="text-4xl font-bold text-center mb-8">
                    Publish a Ride
                </h1>

                {/* Progress Steps */}
                <div className="flex justify-between mb-8">
                    {[1, 2, 3].map((step) => (
                        <motion.div
                            key={step}
                            className={`flex items-center ${currentStep >= step ? 'text-blue-500' : 'text-gray-500'}`}
                            whileHover={{ scale: 1.05 }}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 
                                ${currentStep >= step ? 'border-blue-500 bg-blue-500/20' : 'border-gray-500'}`}>
                                {step}
                            </div>
                            <div className="ml-2">
                                {step === 1 ? 'Route' : step === 2 ? 'Schedule' : 'Review'}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-400"
                    >
                        {error}
                    </motion.div>
                )}

                <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl shadow-xl border border-gray-700">
                    <form onSubmit={handleSubmit}>
                        {renderStep()}

                        {/* Show ride code only on review step and only for other users (not the creator) */}
                        {currentStep === 3 && rideCode && (
                            <div className="mt-6 text-center">
                                <span className="text-gray-400 text-sm">Ride Code (for other users):</span>
                                <div className="text-2xl font-mono font-bold tracking-widest text-blue-400 mt-1 select-all">
                                    {rideCode}
                                </div>
                            </div>
                            
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-8">
                            {currentStep > 1 && (
                                <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setCurrentStep(currentStep - 1)}
                                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                                >
                                    Previous
                                </motion.button>
                            )}
                            {currentStep < 3 ? (
                                <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setCurrentStep(currentStep + 1)}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg ml-auto transition-colors"
                                >
                                    Next
                                </motion.button>
                            ) : (
                                <motion.button
                                    type="submit"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={loading || success}
                                    className={`px-6 py-3 rounded-lg ml-auto flex items-center ${
                                        success ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'
                                    } transition-colors`}
                                >
                                    {loading ? (
                                        <Loader className="animate-spin mr-2" size={20} />
                                    ) : success ? (
                                        <CheckCircle className="mr-2" size={20} />
                                    ) : (
                                        <PlusCircle className="mr-2" size={20} />
                                    )}
                                    {success ? 'Published!' : 'Publish Ride'}
                                </motion.button>
                            )}
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default Publish;