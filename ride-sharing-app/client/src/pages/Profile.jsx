import { useState, useEffect, useRef } from 'react';
import { Camera, Loader, Save, User, Phone, Calendar, UserCircle, MapPin, Car, Edit2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeSection, setActiveSection] = useState('information');
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: '',
    gender: 'male',
    email: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    vehicleType: 'car',
    vehicleNumber: '',
    vehicleModel: '',
    vehicleCompany: '',
    vehicleColor: '',
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
        setFormData(prev => ({
          ...prev,
          name: response.data.name || '',
          phone: response.data.phone || '',
          age: response.data.age || '',
          gender: response.data.gender || 'male',
          email: response.data.email || '',
          street: response.data.street || '',
          city: response.data.city || '',
          state: response.data.state || '',
          zipCode: response.data.zipCode || '',
          country: response.data.country || '',
          vehicleType: response.data.vehicleType || 'car',
          vehicleNumber: response.data.vehicleNumber || '',
          vehicleModel: response.data.vehicleModel || '',
          vehicleCompany: response.data.vehicleCompany || '',
          vehicleColor: response.data.vehicleColor || '',
        }));
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const imgFormData = new FormData();
    imgFormData.append('profileImage', file);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/user/upload-image',
        imgFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      setUser(prev => ({
        ...prev,
        profileImage: response.data.imageUrl
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        'http://localhost:5000/api/user/profile',
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setUser(response.data.user);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1, repeat: Infinity }
          }}
        >
          <Loader className="text-blue-500" size={40} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 md:p-8 lg:p-12 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text"
        >
          Profile Settings
        </motion.h1>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800/50 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-gray-700"
        >
          <div className="flex justify-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="relative"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative cursor-pointer group"
                onClick={handleImageClick}
              >
                {user?.profileImage ? (
                  <img
                    src={`http://localhost:5000${user.profileImage}`}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-500/30"
                  />
                ) : (
                  <UserCircle size={128} className="text-blue-500/70" />
                )}
                <motion.div 
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full"
                >
                  <Camera className="text-white" size={24} />
                </motion.div>
              </motion.div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
              {uploadingImage && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full"
                >
                  <motion.div
                    animate={{ 
                      rotate: 360,
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ 
                      rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                      scale: { duration: 1, repeat: Infinity }
                    }}
                  >
                    <Loader className="text-white" size={24} />
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          </div>
          
          <AnimatePresence mode="wait">
            {isEditing ? (
              <EditProfile
                formData={formData}
                setFormData={setFormData}
                setIsEditing={setIsEditing}
                handleSubmit={handleSubmit}
                saving={saving}
                activeSection={activeSection}
                setActiveSection={setActiveSection}
              />
            ) : (
              <ViewProfile formData={formData} setIsEditing={setIsEditing} />
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
};

function ViewProfile({ formData, setIsEditing }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Profile Information
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all duration-300 shadow-lg hover:shadow-blue-500/20"
        >
          <Edit2 size={18} />
          Edit Profile
        </motion.button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6 bg-gray-800/30 p-6 rounded-xl border border-gray-700/50"
        >
          <div>
            <h3 className="text-gray-400 text-sm">Full Name</h3>
            <p className="text-lg font-medium text-white">{formData.name}</p>
          </div>
          <div>
            <h3 className="text-gray-400 text-sm">Phone</h3>
            <p className="text-lg font-medium text-white">{formData.phone}</p>
          </div>
          <div>
            <h3 className="text-gray-400 text-sm">Email</h3>
            <p className="text-lg font-medium text-white">{formData.email}</p>
          </div>
          <div>
            <h3 className="text-gray-400 text-sm">Age</h3>
            <p className="text-lg font-medium text-white">{formData.age}</p>
          </div>
          <div>
            <h3 className="text-gray-400 text-sm">Gender</h3>
            <p className="text-lg font-medium text-white capitalize">{formData.gender}</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6 bg-gray-800/30 p-6 rounded-xl border border-gray-700/50"
        >
          <div>
            <h3 className="text-gray-400 text-sm">Address</h3>
            <p className="text-lg font-medium text-white">{formData.street}</p>
            <p className="text-lg font-medium text-white">{`${formData.city}, ${formData.state} ${formData.zipCode}`}</p>
            <p className="text-lg font-medium text-white">{formData.country}</p>
          </div>
          <div>
            <h3 className="text-gray-400 text-sm">Vehicle Information</h3>
            <p className="text-lg font-medium text-white capitalize">{`${formData.vehicleType} - ${formData.vehicleCompany} ${formData.vehicleModel}`}</p>
            <p className="text-lg font-medium text-white">{`${formData.vehicleColor} - ${formData.vehicleNumber}`}</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function EditProfile({ formData, setFormData, setIsEditing, handleSubmit, saving, activeSection, setActiveSection }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Edit Profile
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsEditing(false)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
        >
          <X size={18} />
          Cancel
        </motion.button>
      </div>

      <div className="flex gap-4 border-b border-gray-700">
        {['information', 'address', 'vehicle'].map((section) => (
          <motion.button
            key={section}
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
            onClick={() => setActiveSection(section)}
            className={`px-4 py-2 -mb-px font-medium capitalize transition-all duration-300 ${
              activeSection === section
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {section}
          </motion.button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <AnimatePresence mode="wait">
          {activeSection === 'information' && (
            <motion.div
              key="information"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={e => {
                      const { name, value } = e.target;
                      setFormData(prev => ({ ...prev, [name]: value }));
                    }}
                    className="w-full p-4 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                    placeholder="Enter your full name"
                  />
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                </div>
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={e => {
                      const { name, value } = e.target;
                      setFormData(prev => ({ ...prev, [name]: value }));
                    }}
                    className="w-full p-4 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                    placeholder="Enter your phone number"
                  />
                  <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                </div>
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={e => {
                    const { name, value } = e.target;
                    setFormData(prev => ({ ...prev, [name]: value }));
                  }}
                  className="w-full p-4 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Age
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={e => {
                      const { name, value } = e.target;
                      setFormData(prev => ({ ...prev, [name]: value }));
                    }}
                    className="w-full p-4 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                    placeholder="Enter your age"
                  />
                  <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                </div>
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={e => {
                    const { name, value } = e.target;
                    setFormData(prev => ({ ...prev, [name]: value }));
                  }}
                  className="w-full p-4 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </motion.div>
          )}

          {activeSection === 'address' && (
            <motion.div
              key="address"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Street Address
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={e => {
                      const { name, value } = e.target;
                      setFormData(prev => ({ ...prev, [name]: value }));
                    }}
                    className="w-full p-4 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                    placeholder="Enter your street address"
                  />
                  <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={e => {
                      const { name, value } = e.target;
                      setFormData(prev => ({ ...prev, [name]: value }));
                    }}
                    className="w-full p-4 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={e => {
                      const { name, value } = e.target;
                      setFormData(prev => ({ ...prev, [name]: value }));
                    }}
                    className="w-full p-4 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                    placeholder="Enter state"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={e => {
                      const { name, value } = e.target;
                      setFormData(prev => ({ ...prev, [name]: value }));
                    }}
                    className="w-full p-4 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                    placeholder="Enter ZIP code"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={e => {
                      const { name, value } = e.target;
                      setFormData(prev => ({ ...prev, [name]: value }));
                    }}
                    className="w-full p-4 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                    placeholder="Enter country"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'vehicle' && (
            <motion.div
              key="vehicle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Vehicle Type
                </label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={e => {
                    const { name, value } = e.target;
                    setFormData(prev => ({ ...prev, [name]: value }));
                  }}
                  className="w-full p-4 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                >
                  <option value="car">Car</option>
                  <option value="bike">Bike</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Vehicle Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="vehicleNumber"
                    value={formData.vehicleNumber}
                    onChange={e => {
                      const { name, value } = e.target;
                      setFormData(prev => ({ ...prev, [name]: value }));
                    }}
                    className="w-full p-4 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                    placeholder="Enter vehicle number"
                  />
                  <Car className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Vehicle Company
                  </label>
                  <input
                    type="text"
                    name="vehicleCompany"
                    value={formData.vehicleCompany}
                    onChange={e => {
                      const { name, value } = e.target;
                      setFormData(prev => ({ ...prev, [name]: value }));
                    }}
                    className="w-full p-4 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Vehicle Model
                  </label>
                  <input
                    type="text"
                    name="vehicleModel"
                    value={formData.vehicleModel}
                    onChange={e => {
                      const { name, value } = e.target;
                      setFormData(prev => ({ ...prev, [name]: value }));
                    }}
                    className="w-full p-4 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                    placeholder="Enter model name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Vehicle Color
                </label>
                <input
                  type="text"
                  name="vehicleColor"
                  value={formData.vehicleColor}
                  onChange={e => {
                    const { name, value } = e.target;
                    setFormData(prev => ({ ...prev, [name]: value }));
                  }}
                  className="w-full p-4 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                  placeholder="Enter vehicle color"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center p-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl transition duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
        >
          {saving ? (
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                scale: { duration: 1, repeat: Infinity }
              }}
            >
              <Loader size={24} />
            </motion.div>
          ) : (
            <>
              <Save size={24} />
              <span className="ml-2">Save Changes</span>
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}

export default Profile;