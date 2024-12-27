import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; // No Outlet needed here
import "./LayoutLifeguard.css";
import "boxicons/css/boxicons.min.css";

const LayoutLifeguard = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const [totalMoney] = useState(1500); // Example balance for lifeguard

    const handleLogout = () => {
        localStorage.removeItem("userRole");
        localStorage.removeItem("userPoints");
        localStorage.removeItem("balance");
        navigate("/"); // Redirect to Home or Login page
    };

    const navigationItems = [
        { path: "/lifeguard/select-working-hours", label: "Select Working Hours", icon: "bx-time" },
        { path: "/lifeguard/upcoming-hours", label: "Upcoming Hours", icon: "bx-calendar" },
        { path: "/lifeguard/withdraw-money", label: "Withdraw Money", icon: "bx-wallet" },
    ];

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
                        <div className="balance-view">
                            <span className="balance-label">Balance:</span>
                            <span className="balance-amount">{totalMoney} TL</span>
                        </div>
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
