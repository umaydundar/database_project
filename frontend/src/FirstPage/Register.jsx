import React, { useState } from "react";
import "./Register.css";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
    const [role, setRole] = useState("");
    const [sex, setSex] = useState("");
    const [swimmingProficiency, setSwimmingProficiency] = useState("");
    const [inputsVisible, setInputsVisible] = useState(false);
    const navigate = useNavigate();

    const handleRoleChange = (e) => {
        setRole(e.target.value);
        setInputsVisible(true);
    };

    const handleRegisterClick = (e) => {
        e.preventDefault();
        // Replace this alert with your registration logic
        alert(`Role: ${role}, Sex: ${sex}, Swimming Proficiency: ${swimmingProficiency}`);
        // Navigate to the login page after registration
        navigate("/");
    };

    return (
        <div className="register-page">
            <div className="register-box">
                <h1 className="register-top">Create Account</h1>
                <form onSubmit={handleRegisterClick}>
                    {/* Role Selection */}
                    <div className="role-selection">
                        <label htmlFor="role" className="role-label">
                            Select Your Role:
                        </label>
                        <select
                            id="role"
                            className="role-dropdown"
                            value={role}
                            onChange={handleRoleChange}
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

                    {/* Inputs visible only after role selection */}
                    {inputsVisible && (
                        <>
                            {/* First Name */}
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

                            {/* Last Name */}
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

                            {/* Email */}
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

                            {/* Password */}
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

                            {/* Sex Selection */}
                            <div className="role-selection">
                                <label htmlFor="sex" className="role-label">
                                    Select Your Sex:
                                </label>
                                <select
                                    id="sex"
                                    className="role-dropdown"
                                    value={sex}
                                    onChange={(e) => setSex(e.target.value)}
                                    required
                                >
                                    <option value="" disabled>
                                        Select sex
                                    </option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>

                            {/* Swimming Proficiency (only for swimmers) */}
                            {role === "Swimmer" && (
                                <div className="role-selection">
                                    <label htmlFor="swimmingProficiency" className="role-label">
                                        Swimming Proficiency:
                                    </label>
                                    <select
                                        id="swimmingProficiency"
                                        className="role-dropdown"
                                        value={swimmingProficiency}
                                        onChange={(e) => setSwimmingProficiency(e.target.value)}
                                        required
                                    >
                                        <option value="" disabled>
                                            Select proficiency
                                        </option>
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                    </select>
                                </div>
                            )}

                            {/* Register Button */}
                            <button type="submit" className="register-button">
                                Register
                            </button>
                        </>
                    )}
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
