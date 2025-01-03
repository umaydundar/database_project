import axios from "axios";
import "./MainPage.css";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";


const Main = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState(""); // State for username
    const [password, setPassword] = useState(""); // State for password
    const [error, setError] = useState("");

    const handleRegisterClick = () => {
        navigate("/register");
    };

    const handleChangePasswordClick = () => {
        navigate("/change-password");
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                "http://127.0.0.1:8000/api/login/",
                { username, password },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                }
            );

            if (response.status === 200) {
                const { user_role, user_id } = response.data;

                // Store data in localStorage
                localStorage.setItem("userRole", user_role);
                localStorage.setItem("userId", user_id);

                // Navigate based on user role
                if (user_role === "non-member") {
                    localStorage.setItem("nonMemberId", user_id);
                    navigate("/non-member/schedule");
                } else if (user_role === "member") {
                    localStorage.setItem("swimmerId", user_id);
                    navigate("/member/schedule");
                } else if (user_role === "coach") {
                    localStorage.setItem("coachId", user_id);
                    navigate("/coach/schedule");
                } else if (user_role === "admin") {
                    localStorage.setItem("adminId", user_id);
                    navigate("/admin/report");
                } else if (user_role === "lifeguard") {
                    localStorage.setItem("lifeguardId", user_id);
                    navigate("/lifeguard/upcoming-hours");
                } else {
                    navigate("/");
                }
            } else {
                setError("Login failed. Please check your username and password.");
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("An unexpected error occurred.");
        }
    };

    return (
        <div className="main-page">
            <div className="login-box">
                <h1 className="welcome-text">Welcome</h1>
                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <input
                            type="text"
                            id="username"
                            className="input-field"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <input
                            type="password"
                            id="password"
                            className="input-field"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="login-button">
                        Login
                    </button>
                </form>
                <button
                    onClick={handleChangePasswordClick}
                    className="change-password-button"
                >
                    Change Password
                </button>
                <p className="register-text">
                    Don't have an account?{" "}
                    <span onClick={handleRegisterClick} className="register-link">
                        Register
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Main;