import React, { useState } from "react";
import "./Register.css";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
    const [role, setRole] = useState("");
    const navigate = useNavigate();

    const handleRegisterClick = (e) => {
        e.preventDefault();
        // Implement your registration logic here
        alert(`Role selected: ${role}`); // Replace with your navigation logic
    };

    return (
        <div className="register-page">
            <div className="register-box">
                <h1 className="register-top">Create Account</h1>
                <form onSubmit={handleRegisterClick}>
                    <div className="input-group">
                        <input
                            type="text"
                            id="firstName"
                            className="input-field"
                            placeholder="First Name"
                            required
                        />
                        <label htmlFor="firstName" className="input-label">
                            First Name
                        </label>
                    </div>
                    <div className="input-group">
                        <input
                            type="text"
                            id="lastName"
                            className="input-field"
                            placeholder="Last Name"
                            required
                        />
                        <label htmlFor="lastName" className="input-label">
                            Last Name
                        </label>
                    </div>
                    <div className="input-group">
                        <input
                            type="email"
                            id="email"
                            className="input-field"
                            placeholder="Email"
                            required
                        />
                        <label htmlFor="email" className="input-label">
                            Email
                        </label>
                    </div>
                    <div className="input-group">
                        <input
                            type="password"
                            id="password"
                            className="input-field"
                            placeholder="Password"
                            required
                        />
                        <label htmlFor="password" className="input-label">
                            Password
                        </label>
                    </div>
                    <div className="role-selection">
                        <label htmlFor="role" className="role-label">
                            Select Your Role:
                        </label>
                        <select
                            id="role"
                            className="role-dropdown"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            required
                        >
                            <option value="" disabled>
                                Select a role
                            </option>
                            <option value="Swimmer">Swimmer</option>
                            <option value="Coach">Coach</option>
                            <option value="Lifeguard">Lifeguard</option>
                        </select>
                    </div>
                    <button type="submit" className="register-button">
                        Register
                    </button>
                </form>
                <p className="login-text">
                    Already have an account?{" "}
                    <span onClick={() => navigate("/")} className="login-link">
                        Login
                    </span>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;