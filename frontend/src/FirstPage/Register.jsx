import React, { useState } from "react";
import axios from "axios";
import "./Register.css";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
    const [role, setRole] = useState("");
    const [sex, setSex] = useState("");
    const [swimmingProficiency, setSwimmingProficiency] = useState("");
    const [inputsVisible, setInputsVisible] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleRoleChange = (e) => {
        setRole(e.target.value);
        setInputsVisible(true);
    };

    const handleRegisterClick = async (e) => {
        e.preventDefault();
        e.preventDefault();
        const formData = {
            role,
            sex,
            swimmingProficiency,
            firstName: e.target.firstName.value,
            lastName: e.target.lastName.value,
            username: e.target.username.value,
            password: e.target.password.value,
        };

        console.log(formData);

        try {
            const response = await axios.post(
                "http://127.0.0.1:8000/api/register/", 
                formData,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    withCredentials: true, 
                }
            );

            if (response.status === 200) {
                navigate("/"); 
            } else {
                setError("Registration failed. Please try again.");
            }
        } catch (err) {
            setError("An unexpected error occurred.");
        }
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

                            {/* username*/}
                            <div className="input-group">
                                <input
                                    type="text"
                                    id="username"
                                    className="input-field"
                                    placeholder="Username"
                                    required
                                />
                                <label htmlFor="username" className="input-label">
                                    Username
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