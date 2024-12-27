import React, { useState } from "react";
import "./ChangePassword.css";
import { useNavigate } from "react-router-dom";

const ChangePassword = () => {
    const [formData, setFormData] = useState({
        username: "",
        currentPassword: "",
        newPassword: "",
    });

    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { username, currentPassword, newPassword } = formData;

        try {
            const response = await fetch("/api/change-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, currentPassword, newPassword }),
            });

            if (response.ok) {
                navigate("/login");
            } else {
                const result = await response.json();
                setError(result.error || "Failed to change password.");
            }
        } catch (err) {
            setError("An unexpected error occurred.");
        }
    };

    return (
        <div className="change-password-page">
            <div className="change-password-box">
                <h1 className="change-password-top">Change Password</h1>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input
                            type="text"
                            id="username"
                            name="username"
                            className="input-field"
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                        <label htmlFor="username" className="input-label">
                            Username
                        </label>
                    </div>
                    <div className="input-group">
                        <input
                            type="password"
                            id="currentPassword"
                            name="currentPassword"
                            className="input-field"
                            placeholder="Current Password"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            required
                        />
                        <label htmlFor="currentPassword" className="input-label">
                            Current Password
                        </label>
                    </div>
                    <div className="input-group">
                        <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            className="input-field"
                            placeholder="New Password"
                            value={formData.newPassword}
                            onChange={handleChange}
                            required
                        />
                        <label htmlFor="newPassword" className="input-label">
                            New Password
                        </label>
                    </div>
                    <button type="submit" className="change-password-button">
                        Change Password
                    </button>
                </form>
                <p className="login-text">
                    Remembered your credentials?{" "}
                    <span onClick={() => navigate("/")} className="login-link">
                        Login
                    </span>
                </p>
            </div>
        </div>
    );
};

export default ChangePassword;
