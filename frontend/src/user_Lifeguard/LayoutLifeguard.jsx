import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios"; // For making API requests
import "./LayoutLifeguard.css";
import "boxicons/css/boxicons.min.css";

const LayoutLifeguard = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const [totalMoney, setTotalMoney] = useState(null); // Lifeguard's balance
    const [error, setError] = useState(null); // Error handling
    const [loading, setLoading] = useState(true); // Loading state

    // Fetch the lifeguard's balance from the backend
    const fetchBalance = async () => {
        try {
            setLoading(true);
            const workerId = localStorage.getItem("lifeguardId"); // Assuming workerId is stored in localStorage
            
            if (!workerId) {
                throw new Error("Worker ID not found. Please log in again.");
            }

            const response = await axios.get(`http://127.0.0.1:8000/api/get_balance//?worker_id=${workerId}`);
            setTotalMoney(response.data.balance);
        } catch (err) {
            console.error("Error fetching balance:", err);
            setError(err.response?.data?.error || "Failed to fetch balance.");
        } finally {
            setLoading(false);
        }
    };

    // Handle logout
    const handleLogout = () => {
        localStorage.clear(); // Clear all localStorage items
        localStorage.clear(); // Clear all localStorage items
        navigate("/"); // Redirect to Home or Login page
    };

    // Navigation items for the sidebar
    // Navigation items for the sidebar
    const navigationItems = [
        { path: "/lifeguard/select-working-hours", label: "Select Working Hours", icon: "bx-time" },
        { path: "/lifeguard/upcoming-hours", label: "Upcoming Hours", icon: "bx-calendar" },
        { path: "/lifeguard/withdraw-money", label: "Withdraw Money", icon: "bx-wallet" },
    ];

    // Fetch balance when the component mounts
    useEffect(() => {
        fetchBalance();
    }, []);

    // Fetch balance when the component mounts
    useEffect(() => {
        fetchBalance();
    }, []);

    return (
        <div className="lifeguard-layout">
            {/* Sidebar */}
            <div className="sidebar always-open">
                <div className="sidebar-content">
                    <div className="logo">
                        <i className="bx bx-shield icon"></i>
                        <span className="logo-name">Welcome, Lifeguard</span>
                    </div>

                    {/* Balance View */}
                    <div className="balance-container">
                        {loading ? (
                            <span>Loading balance...</span>
                        ) : error ? (
                            <span className="error">{error}</span>
                        ) : (
                            <div className="balance-view">
                                <span className="balance-label">Balance:</span>
                                <span className="balance-amount">{totalMoney} TL</span>
                            </div>
                        )}
                        {loading ? (
                            <span>Loading balance...</span>
                        ) : error ? (
                            <span className="error">{error}</span>
                        ) : (
                            <div className="balance-view">
                                <span className="balance-label">Balance:</span>
                                <span className="balance-amount">{totalMoney} TL</span>
                            </div>
                        )}
                    </div>

                    {/* Navigation Links */}
                    <ul className="lists">
                        {navigationItems.map((item) => (
                            <li
                                key={item.path}
                                className={`list ${location.pathname === item.path ? "active" : ""}`}
                            >
                                <Link to={item.path} className="nav-link">
                                    <i className={`bx ${item.icon} icon`}></i>
                                    <span className="link">{item.label}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {/* Logout Button */}
                    <div className="bottom-content">
                        <li className="list">
                            <button onClick={handleLogout} className="nav-link">
                                <i className="bx bx-log-out icon"></i>
                                <span className="link">Log out</span>
                            </button>
                        </li>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="main-content">
                {children ? (
                    children
                ) : (
                    <div className="placeholder-content">
                        <h2>Please select an option from the menu.</h2>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LayoutLifeguard;
