import mongoose from 'mongoose';

const VehicleSchema = new mongoose.Schema({
    number: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    model: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    verified: { type: Boolean, default: false },
    company: { type: String },
    color: { type: String },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Vehicle", VehicleSchema);
