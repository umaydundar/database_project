import React from "react";
import "./MainPage.css";
import { useNavigate } from "react-router-dom";

const Main = () => {
    const navigate = useNavigate();

    const handleRegisterClick = () => {
        navigate("/register"); // Navigation to the register page
    };

    const handleChangePasswordClick = () => {
        navigate("/change-password"); // Navigation to the change password page
    };

    const handleLogin = (e) => {
        e.preventDefault();
        // Implement your login logic here
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
                            required
                        />
                    </div>
                    <div className="input-group">
                        <input
                            type="password"
                            id="password"
                            className="input-field"
                            placeholder="Password"
                            required
                        />
                    </div>
                    <button type="submit" className="login-button">
                        Login
                    </button>
                </form>
                <p className="register-text">
                    Don't have an account?{" "}
                    <span onClick={handleRegisterClick} className="register-link">
                        Register
                    </span>
                </p>
                <button
                    onClick={handleChangePasswordClick}
                    className="change-password-button"
                >
                    Change Password
                </button>
            </div>
        </div>
    );
};

export default Main;