import axios from "axios";
import "./MainPage.css";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { useUser } from "../UserContext";


const Main = () => {
    const navigate = useNavigate();
    const { setUsername: setGlobalUsername } = useUser(); 
    const [username, setUsername] = useState(""); 
    const [password, setPassword] = useState(""); 
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
                setGlobalUsername(username); // Save the username globally
                const userRole = response.data.user_role;

                if (userRole === "non-member") navigate("/non-member/schedule");
                else if (userRole === "member") navigate("/member/schedule");
                else if (userRole === "coach") navigate("/coach/schedule");
                else if (userRole === "admin") navigate("/admin/report");
                else if (userRole === "lifeguard") navigate("/lifeguard/upcoming-hours");
                else navigate("/");
            } else {
                setError("Login failed");
            }
        } catch (err) {
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
