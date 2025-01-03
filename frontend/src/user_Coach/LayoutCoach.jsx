import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./LayoutCoach.css";
import "boxicons/css/boxicons.min.css";
import axios from "axios";

const LayoutCoach = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const workerId = localStorage.getItem("coachId");
    const [totalMoney, setTotalMoney] = useState(1500);
    const [generalRating, setGeneralRating] = useState(0); 
    const userId = localStorage.getItem("userId");

    useEffect(() => {
        const fetchCoach = async () => {
            try {
                const response = await axios.get(
                    "http://127.0.0.1:8000/api/get_coach/",
                    {
                        params: { userId},
                        headers: {
                            "Content-Type": "application/json",
                        },
                        withCredentials: true,
                    }
                );
                

                console.log(response.data);

                if (response.status === 200) {

                    setGeneralRating(response.data.coach.avg_rating);
                    setTotalMoney(response.data.coach.balance);
                }
            } catch (error) {
                console.error("Failed to fetch coach data:", error);
            }
        };

        if (userId) {
            fetchCoach();
        }
    }, [userId]);

    const handleLogout = () => {
        localStorage.removeItem("userRole");
        localStorage.removeItem("userPoints");
        localStorage.removeItem("balance");
        navigate("/");
    };

    const navigationItems = [
        { path: "/coach/create-course", label: "Create Course", icon: "bx-plus-circle" },
        { path: "/coach/view-courses", label: "View Courses", icon: "bx-book" },
        { path: "/coach/withdraw-money", label: "Withdraw Money", icon: "bx-wallet" },
        { path: "/coach/profile", label: "Profile", icon: "bx-user" },
    ];

    return (
        <div className="coach-layout">
            <div className="sidebar always-open">
                <div className="sidebar-content">
                    <div className="logo">
                        <i className="bx bx-trophy icon"></i>
                        <span className="logo-name">Welcome Coach</span>
                    </div>
                    <div className="balance-container">
                        <div className="balance-view">
                            <span className="balance-label">Your Rating:</span>
                            <span className="balance-amount">
                                {generalRating !== null && generalRating !== undefined
                                    ? `${generalRating.toFixed(1)} / 5`
                                    : "Loading..."}
                            </span>
                        </div>
                        <div className="balance-view">
                            <span className="balance-label">Balance:</span>
                            <span className="balance-amount">{totalMoney} TL</span>
                        </div>
                    </div>
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
            <div className="main-content">{children}</div>
        </div>
    );
};

export default LayoutCoach;
