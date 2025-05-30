const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
require('./models/Booking');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const UserSchema = new mongoose.Schema({
  name: String,
  phone: String,
  password: String,
});

const User = mongoose.model("User", UserSchema);

const RideSchema = new mongoose.Schema({
  rideId: {
    type: String,
    unique: true,
    required: true,
    default: () => Math.random().toString(36).substr(2, 9).toUpperCase()
  },
  from: String,
  to: String,
  date: Date,
  time: {
    hour: Number,
    minute: Number,
    ampm: String
  },
  seats: Number,
  genderPreference: String,
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Ride = mongoose.model("Ride", RideSchema);

// Register API
app.post("/api/register", async (req, res) => {
  const { name, phone, password } = req.body;

  // Check if the user already exists
  const existingUser = await User.findOne({ phone });
  if (existingUser) {
    return res.status(400).json({ success: false, message: "User already exists" });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ name, phone, password: hashedPassword });

  try {
    await newUser.save();
    res.json({ success: true, message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, message: "Error registering user" });
  }
});

// Login API
app.post("/api/login", async (req, res) => {
  const { phone, password } = req.body;

  // Check if the user exists
  const user = await User.findOne({ phone });
  if (!user) {
    return res.status(401).json({ success: false, message: "User not found" });
  }

  // Compare passwords
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  // Generate JWT token
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h", // Token expiration time (1 hour)
  });

  res.json({
    success: true,
    message: "Login successful",
    token, // Send the JWT token to the client
  });
});

// Rides API
app.get("/api/rides", async (req, res) => {
  try {
    const rides = await Ride.find().populate('driver').sort({ createdAt: -1 });
    res.json({ success: true, rides });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching rides" });
  }
});


// JWT authentication middleware
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
}

// Example ride creation endpoint
app.post("/api/rides", authenticate, async (req, res) => {
  try {
    const { from, to, date, time, seats, genderPreference } = req.body;
    const driver = req.user.userId;

    const newRide = new Ride({
      rideId: Math.random().toString(36).substr(2, 9).toUpperCase(), // Generate unique ID
      from,
      to,
      date,
      time,
      seats,
      genderPreference,
      driver
    });

    await newRide.save();
    res.json({ 
      success: true, 
      ride: {
        ...newRide._doc,
        rideId: newRide.rideId
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error creating ride",
      error: error.message 
    });
  }
});

// Start server
app.listen(5000,() => console.log("Server running on port 5000"));
