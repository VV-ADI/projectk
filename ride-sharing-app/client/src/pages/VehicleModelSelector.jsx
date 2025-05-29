import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const VehicleSelector = () => {
    
    const [vehicleType, setVehicleType] = useState("");
    const [brands, setBrands] = useState([]);
    const [selectedBrand, setSelectedBrand] = useState("");
    const [models, setModels] = useState([]);
    const [selectedModel, setSelectedModel] = useState("");
    const [selectedColor, setSelectedColor] = useState("");

    // Available colors
    const colors = ["Black", "White", "Red", "Blue", "Silver", "Grey", "Green", "Yellow"];

    // Fetch brands based on vehicle type
    useEffect(() => {
        if (!vehicleType) return;

        const fetchBrands = async () => {
            try {
                const response = await fetch(
                    `https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/${vehicleType}?format=json`
                );
                const data = await response.json();
                const brandList = data.Results.map((item) => item.MakeName);
                setBrands(brandList);
            } catch (error) {
                console.error("Error fetching brands:", error);
            }
        };

        fetchBrands();
    }, [vehicleType]);

    // Fetch models based on brand
    useEffect(() => {
        if (!selectedBrand) return;

        const fetchModels = async () => {
            try {
                const response = await fetch(
                    `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/${selectedBrand}?format=json`
                );
                const data = await response.json();
                const modelList = data.Results.map((item) => item.Model_Name);
                setModels(modelList);
            } catch (error) {
                console.error("Error fetching models:", error);
            }
        };

        fetchModels();
    }, [selectedBrand]);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }} 
            className="p-8 bg-gray-900 rounded-lg shadow-lg space-y-6"
        >
            {/* Vehicle Type Selection */}
            <div>
                <label className="block text-lg font-medium text-gray-300 mb-2">Vehicle Type</label>
                <select
                    className="w-full p-4 text-lg bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-700 transition-all text-white"
                    value={vehicleType}
                    onChange={(e) => {
                        setVehicleType(e.target.value);
                        setSelectedBrand("");
                        setSelectedModel("");
                        setBrands([]);
                        setModels([]);
                    }}
                >
                    <option value="">Select Vehicle Type</option>
                    <option value="car">Car</option>
                    <option value="motorcycle">Bike</option>
                </select>
            </div>

            {/* Brand Selection */}
            {vehicleType && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                    <label className="block text-lg font-medium text-gray-300 mb-2">Brand</label>
                    <select
                        className="w-full p-4 text-lg bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-700 transition-all text-white"
                        value={selectedBrand}
                        onChange={(e) => {
                            setSelectedBrand(e.target.value);
                            setSelectedModel("");
                        }}
                    >
                        <option value="">Select Brand</option>
                        {brands.length > 0 ? (
                            brands.map((brand, index) => (
                                <option key={index} value={brand}>{brand}</option>
                            ))
                        ) : (
                            <option disabled>Loading brands...</option>
                        )}
                    </select>
                </motion.div>
            )}

            {/* Model Selection */}
            {selectedBrand && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                    <label className="block text-lg font-medium text-gray-300 mb-2">Model</label>
                    <select
                        className="w-full p-4 text-lg bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-700 transition-all text-white"
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                    >
                        <option value="">Select Model</option>
                        {models.length > 0 ? (
                            models.map((model, index) => (
                                <option key={index} value={model}>{model}</option>
                            ))
                        ) : (
                            <option disabled>Loading models...</option>
                        )}
                    </select>
                </motion.div>
            )}

            {/* Color Selection */}
            {selectedModel && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                    <label className="block text-lg font-medium text-gray-300 mb-2">Color</label>
                    <select
                        className="w-full p-4 text-lg bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-700 transition-all text-white"
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                    >
                        <option value="">Select Color</option>
                        {colors.map((color, index) => (
                            <option key={index} value={color}>{color}</option>
                        ))}
                    </select>
                </motion.div>
            )}
        </motion.div>
    );
};

export default VehicleSelector;
