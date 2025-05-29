import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Search from "./pages/Search";
import Publish from "./pages/Publish";
import Inbox from "./pages/Inbox";
import Profile from "./pages/Profile";
import Footer from "./pages/Footer";
import { useEffect, useState } from "react";

// 🔒 Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    return token ? children : <Navigate to="/login" />;
};

// 📍 Wrapper to use hooks like useLocation outside Router
const AppWrapper = () => {
    const location = useLocation();
    const hideFooter = location.pathname === "/login" || location.pathname === "/register";

    return (
        <div className="min-h-screen flex flex-col">
            <Routes>
                <Route path="/" element={<Navigate to="/register" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
                <Route path="/publish" element={<ProtectedRoute><Publish /></ProtectedRoute>} />
                <Route path="/inbox" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            </Routes>

            {/* ✅ Footer hidden on login & register */}
            {!hideFooter && <Footer />}
        </div>
    );
};

function App() {
    return (
        <Router>
            <AppWrapper />
        </Router>
    );
}

export default App;
