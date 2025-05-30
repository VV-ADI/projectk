import mongoose from 'mongoose';

// Define User Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String },
  age: { type: Number },
  gender: { type: String },
  profileImage: { type: String },
  // Address fields
  street: { type: String },
  city: { type: String },
  state: { type: String },
  zipCode: { type: String },
  country: { type: String },
  // Vehicle fields
  vehicleType: { type: String },
  vehicleNumber: { type: String },
  vehicleModel: { type: String },
  vehicleCompany: { type: String },
  vehicleColor: { type: String },
  identityVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", UserSchema);
