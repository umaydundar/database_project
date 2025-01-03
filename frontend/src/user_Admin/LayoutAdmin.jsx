import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./LayoutAdmin.css";
import "boxicons/css/boxicons.min.css";

const LayoutAdmin = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const [adminName] = useState("Admin");

    const handleLogout = () => {
        localStorage.removeItem("userRole");
        navigate("/"); // Redirect to Home or Login page
    };

    const navigationItems = [
        { path: "/admin/manage-users", label: "Manage Users", icon: "bx-user" },
        { path: "/admin/manage-courses", label: "Manage Courses", icon: "bx-book" },
        { path: "/admin/report", label: "Reports", icon: "bx-bar-chart" },
    ];

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <div className="sidebar always-open">
                <div className="sidebar-content">
                    {/* Admin Logo */}
                    <div className="logo">
                        <i className="bx bx-shield icon"></i>
                        <span className="logo-name">Welcome, {adminName}</span>
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
                        <ul>
                            <li className="list">
                                <button onClick={handleLogout} className="nav-link logout-button">
                                    <i className="bx bx-log-out icon"></i>
                                    <span className="link">Log out</span>
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="main-content">
                <div className="content-wrapper">{children}</div>
            </div>
        </div>
    );
};

export default LayoutAdmin;