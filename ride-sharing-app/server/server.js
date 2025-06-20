import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import User from './models/User.js';
import Vehicle from './models/Vehicle.js';
import Ride from './models/Ride.js';
import Booking from './models/Booking.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Ensure 'uploads' directory exists
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => console.log("❌ MongoDB Connection Error:", err));

// Authentication Middleware
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
        return res.status(401).json({ success: false, message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid token" });
    }
};

// Register User
app.post("/api/register", async (req, res) => {
    try {
        const { name, phone, password, age, gender } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = new User({
            name,
            phone,
            password: hashedPassword,
            age,
            gender,
            profileImage: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`
        });
        

        await user.save();

        // Generate token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                phone: user.phone,
                profileImage: user.profileImage
            }
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ success: false, message: "Error registering user" });
    }
});

// Login User
app.post("/api/login", async (req, res) => {
    try {
        const { phone, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        // Generate token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                phone: user.phone,
                profileImage: user.profileImage
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: "Error logging in" });
    }
});

// Get User Profile
app.get("/api/user/profile", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        console.error("Profile fetch error:", error);
        res.status(500).json({ success: false, message: "Error fetching profile" });
    }
});

// Update User Profile
app.put("/api/user/profile", authMiddleware, async (req, res) => {
    try {
        const {
            name, phone, email, age, gender,
            street, city, state, zipCode, country,
            vehicleType, vehicleNumber, vehicleModel, vehicleCompany, vehicleColor
        } = req.body;

        const updateData = {
            name, phone, email, age, gender,
            street, city, state, zipCode, country,
            vehicleType, vehicleNumber, vehicleModel, vehicleCompany, vehicleColor
        };

        // Remove undefined fields
        Object.keys(updateData).forEach(key => 
            (updateData[key] === undefined || updateData[key] === '') && delete updateData[key]
        );

        const user = await User.findByIdAndUpdate(
            req.userId,
            updateData,
            { new: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ success: true, user });
    } catch (error) {
        console.error("Profile update error:", error);
        res.status(500).json({ success: false, message: "Error updating profile" });
    }
});

// Route to handle profile image upload
app.post("/api/user/upload-image", authMiddleware, upload.single("profileImage"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        // Construct image URL
        const imageUrl = `/uploads/${req.file.filename}`;

        // Update user profile with the uploaded image
        await User.findByIdAndUpdate(req.userId, { profileImage: imageUrl });

        res.json({ success: true, imageUrl });
    } catch (error) {
        console.error("❌ Image upload error:", error);
        res.status(500).json({ success: false, message: "Error uploading image" });
    }
});


// Register Vehicle
app.post("/api/vehicles", authMiddleware, async (req, res) => {
    try {
        const { number, type, model } = req.body;

        const existingVehicle = await Vehicle.findOne({ number });
        if (existingVehicle) {
            return res.status(400).json({ success: false, message: "Vehicle already registered" });
        }

        const vehicle = new Vehicle({
            number,
            type,
            model,
            owner: req.userId
        });

        await vehicle.save();
        res.json({ success: true, vehicle });
    } catch (error) {
        console.error("Vehicle registration error:", error);
        res.status(500).json({ success: false, message: "Error registering vehicle" });
    }
});

// Get User's Vehicles
app.get("/api/vehicles", authMiddleware, async (req, res) => {
    try {
        const vehicles = await Vehicle.find({ owner: req.userId });
        res.json({ success: true, vehicles });
    } catch (error) {
        console.error("Vehicle fetch error:", error);
        res.status(500).json({ success: false, message: "Error fetching vehicles" });
    }
});

// Get all rides except the ones published by current user
app.get("/api/rides/others", authMiddleware, async (req, res) => {
  try {
    const rides = await Ride.find({
      driver: { $ne: req.userId },
      status: 'active'
    })
    .populate('driver', '-password')
    .sort({ createdAt: -1 });

    res.json({ success: true, rides });
  } catch (error) {
    console.error("Error fetching rides from other users:", error);
    res.status(500).json({ success: false, message: "Failed to fetch rides" });
  }
});


// Publish a Ride
app.post("/api/rides", authMiddleware, async (req, res) => {
    try {
        const { from, to, date, time, seats, genderPreference } = req.body;

        // ✅ Step 1: Log incoming data
        console.log("🚗 Incoming ride publish data:", {
            from, to, date, time, seats, genderPreference
            
        });

        // ✅ Step 2: Check for all required fields
        if (!from || !to || !date || !time || !seats) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // ✅ Step 3: Validate time format
        if (
            typeof time.hour !== 'number' ||
            typeof time.minute !== 'number' ||
            !['AM', 'PM'].includes(time.ampm)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid time format"
            });
        }

        // ✅ Step 4: (REMOVE vehicle check)
        // const vehicle = await Vehicle.findOne({ owner: req.userId });
        // if (!vehicle) {
        //     return res.status(404).json({
        //         success: false,
        //         message: "Vehicle not found or not owned by user"
        //     });
        // }

        // ✅ Step 5: Create ride (REMOVE vehicleId from ride creation)
        const ride = new Ride({
            driver: req.userId,
            from,
            to,
            date: new Date(date),
            time,
            seats,
            genderPreference,
            // vehicle: vehicle._id, // <-- REMOVE THIS LINE
        });

        await ride.save();

        // ✅ Step 6: Populate and return (REMOVE .populate('vehicle'))
        const populatedRide = await Ride.findById(ride._id)
            .populate('driver', '-password');
            // .populate('vehicle'); // <-- REMOVE THIS LINE

        res.json({ success: true, ride: populatedRide });

    } catch (error) {        console.error("❌ Ride publish error:", error);
        res.status(500).json({
            success: false,
            message: "Error publishing ride"
        });
    }
});

// Search Rides
app.get("/api/rides/search", async (req, res) => {
    try {
        const { from, to, date } = req.query;

        const searchDate = new Date(date);
        const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));

        const rides = await Ride.find({
            from: { $regex: from, $options: 'i' },
            to: { $regex: to, $options: 'i' },
            date: { $gte: startOfDay, $lte: endOfDay },
            status: 'active'
        })
        .populate('driver', '-password')
        .sort({ date: 1, 'time.hour': 1, 'time.minute': 1 });

        res.json({ success: true, rides });
    } catch (error) {
        console.error("Ride search error:", error);
        res.status(500).json({ success: false, message: "Error searching rides" });
    }
});

// Get User's Published Rides
app.get("/api/rides/published", authMiddleware, async (req, res) => {
    try {
        const rides = await Ride.find({ driver: req.userId })
            .populate('driver', '-password')
            .sort({ createdAt: -1 });

        res.json({ success: true, rides });
    } catch (error) {
        console.error("Published rides fetch error:", error);
        res.status(500).json({ success: false, message: "Error fetching published rides" });
    }
});

// Get All Rides
app.get("/api/rides", async (req, res) => {
    try {
        const rides = await Ride.find().sort({ createdAt: -1 });
        res.json({ success: true, rides });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching rides" });
    }
});

// MongoDB query for testing
app.get("/api/rides/test", async (req, res) => {
    try {
        const rides = await Ride.find().sort({ createdAt: -1 });
        res.json({ success: true, rides });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching rides" });
    }
});

// Book a Ride
app.post("/api/bookings", authMiddleware, async (req, res) => {
    try {
        const { rideId, passengers, phone, message } = req.body;
        const userId = req.userId;
        // Find the ride
        const ride = await Ride.findById(rideId);
        if (!ride) {
            return res.status(404).json({ success: false, message: "Ride not found" });
        }
        // Create booking
        const booking = new Booking({
            ride: ride._id,
            user: userId,
            passengers,
            phone,
            message,
            price: 0, // Set price logic if needed
            status: 'confirmed'
        });
        await booking.save();
        // Delete the ride after booking
        await Ride.findByIdAndDelete(rideId);
        res.json({ success: true, message: "Ride has been booked", booking });
    } catch (error) {
        console.error("Booking error:", error);
        res.status(500).json({ success: false, message: "Failed to book ride" });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));