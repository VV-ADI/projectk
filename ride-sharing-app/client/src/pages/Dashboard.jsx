import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../pages/Footer";

const Dashboard = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUserName = localStorage.getItem("userName");

        if (!token) {
            navigate("/login");
        } else {
            if (storedUserName) setUserName(storedUserName);
            navigate("/search"); // Redirects to Search page immediately
        }
    }, [navigate]);

    return null; // Since it immediately navigates, no need to render anything
};

export default Dashboard;
