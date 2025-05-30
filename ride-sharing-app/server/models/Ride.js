import mongoose from 'mongoose';

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
    status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Ride", RideSchema);
