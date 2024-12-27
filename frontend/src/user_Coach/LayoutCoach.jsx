import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; // No Outlet needed here
import "./LayoutCoach.css";
import "boxicons/css/boxicons.min.css";

const LayoutCoach = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const [totalMoney] = useState(1500);
    const [generalRating] = useState(4.5);

    const handleLogout = () => {
        localStorage.removeItem("userRole");
        localStorage.removeItem("userPoints");
        localStorage.removeItem("balance");
        navigate("/"); // Redirect to Home or Login page
    };

    const navigationItems = [
        { path: "/coach/create-course", label: "Create Course", icon: "bx-plus-circle" },
        { path: "/coach/schedule", label: "Schedule", icon: "bx-calendar" },
        { path: "/coach/view-courses", label: "View Courses", icon: "bx-book" },
        { path: "/coach/withdraw-money", label: "Withdraw Money", icon: "bx-wallet" },
    ];

    return (
        <div className="coach-layout">
            {/* Sidebar */}
            <div className="sidebar always-open">
                <div className="sidebar-content">
                    <div className="logo">
                        <i className="bx bx-trophy icon"></i>
                        <span className="logo-name">Welcome, Coach</span>
                    </div>

                    {/* Balance View */}
                    <div className="balance-container">
                        <div className="balance-view">
                            <span className="balance-label">Your Rating:</span>
                            <span className="balance-amount">{generalRating.toFixed(1)} / 5</span>
                        </div>
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
            <div className="main-content">{children}</div>
        </div>
    );
};

export default LayoutCoach;
