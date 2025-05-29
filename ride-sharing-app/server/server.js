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

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(express.json());
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
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => console.log("❌ MongoDB Connection Error:", err));

// User Schema & Model
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    age: { type: Number }, // <-- Add this
    gender: { type: String }, // <-- And this
    profileImage: { type: String, default: null },
    identityVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});


const User = mongoose.model("User", UserSchema);

// Vehicle Schema & Model
const VehicleSchema = new mongoose.Schema({
    number: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    model: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    verified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const Vehicle = mongoose.model("Vehicle", VehicleSchema);

// Ride Schema & Model
const RideSchema = new mongoose.Schema({
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    date: { type: Date, required: true },
    time: {
        hour: { type: Number, required: true },
        minute: { type: Number, required: true },
        ampm: { type: String, required: true, enum: ['AM', 'PM'] }
    },
    seats: { type: Number, required: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
    createdAt: { type: Date, default: Date.now }
});

const Ride = mongoose.model("Ride", RideSchema);

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
// Update User Profile
app.put("/api/user/profile", authMiddleware, async (req, res) => {
    try {
        const { name, phone, profileImage, age, gender } = req.body; // Include age & gender
        const user = await User.findByIdAndUpdate(
            req.userId,
            { name, phone, profileImage, age, gender }, // Update age & gender too
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

// Publish a Ride
app.post("/api/rides", authMiddleware, async (req, res) => {
    try {
        const { from, to, date, time, seats, vehicleId } = req.body;

        // ✅ Log input to debug
        console.log("Incoming ride publish data:", { from, to, date, time, seats, vehicleId });

        // ✅ Validate required fields
        if (!from || !to || !date || !time || !seats || !vehicleId) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // ✅ Validate time format
        if (
            typeof time.hour !== 'number' ||
            typeof time.minute !== 'number' ||
            !['AM', 'PM'].includes(time.ampm)
        ) {
            return res.status(400).json({ success: false, message: "Invalid time format" });
        }

        const vehicle = await Vehicle.findOne({ _id: vehicleId, owner: req.userId });
        if (!vehicle) {
            return res.status(404).json({ success: false, message: "Vehicle not found or not owned by user" });
        }

        const ride = new Ride({
            driver: req.userId,
            from,
            to,
            date: new Date(date),
            time,
            seats,
            vehicle: vehicleId
        });

        await ride.save();

        const populatedRide = await Ride.findById(ride._id)
            .populate('driver', '-password')
            .populate('vehicle');

        res.json({ success: true, ride: populatedRide });

    } catch (error) {
        console.error("❌ Ride publish error:", error);
        res.status(500).json({ success: false, message: "Error publishing ride" });
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
        .populate('vehicle')
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
            .populate('vehicle')
            .sort({ createdAt: -1 });

        res.json({ success: true, rides });
    } catch (error) {
        console.error("Published rides fetch error:", error);
        res.status(500).json({ success: false, message: "Error fetching published rides" });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));