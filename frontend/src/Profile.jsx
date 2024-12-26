// Profile.jsx
import React, { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import './Profile.css';

const Profile = () => {
    // Mock user data
    const initialUserData = {
        name: 'John Doe',
        email: 'johndoe@example.com',
        profilePicture: 'https://via.placeholder.com/150', // Placeholder image
        password: 'password123', // In real applications, never handle passwords like this
    };

    const [userData, setUserData] = useState(initialUserData);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState(initialUserData);
    const [passwordVisible, setPasswordVisible] = useState(false);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedData({
            ...editedData,
            [name]: value,
        });
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        setUserData(editedData);
        setIsEditing(false);
        alert('Profile updated successfully!');
    };

    // Handle cancel editing
    const handleCancel = () => {
        setEditedData(userData);
        setIsEditing(false);
    };

    // Handle logout (placeholder)
    const handleLogout = () => {
        // Implement your logout logic here (e.g., clearing auth tokens)
        alert('Logged out successfully!');
    };

    return (
        <div className="profile-main-container">
            <div className="profile-bottom-container">
                <Sidebar />
                <div className="profile-content-container">
                    <h1 className="profile-heading">My Profile</h1>

                    {/* User Information */}
                    <div className="profile-user-info">
                        <img src={userData.profilePicture} alt="Profile" className="profile-picture" />
                        {!isEditing ? (
                            <div className="profile-details">
                                <p><strong>Name:</strong> {userData.name}</p>
                                <p><strong>Email:</strong> {userData.email}</p>
                                <p>
                                    <strong>Password:</strong>
                                    <span
                                        className="profile-password-toggle"
                                        onClick={() => setPasswordVisible(!passwordVisible)}
                                    >
                                        {passwordVisible ? ' Hide' : ' Show'}
                                    </span>
                                    {passwordVisible ? ` ${userData.password}` : ' ••••••••'}
                                </p>
                                <button
                                    className="profile-edit-button"
                                    onClick={() => setIsEditing(true)}
                                >
                                    Edit Profile
                                </button>
                                <button
                                    className="profile-logout-button"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <form className="profile-edit-form" onSubmit={handleSubmit}>
                                <div className="profile-form-group">
                                    <label htmlFor="name">Name:</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={editedData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="profile-form-group">
                                    <label htmlFor="email">Email:</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={editedData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="profile-form-group">
                                    <label htmlFor="password">Password:</label>
                                    <input
                                        type={passwordVisible ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        value={editedData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <span
                                        className="profile-password-toggle"
                                        onClick={() => setPasswordVisible(!passwordVisible)}
                                    >
                                        {passwordVisible ? 'Hide' : 'Show'}
                                    </span>
                                </div>
                                <div className="profile-form-buttons">
                                    <button type="submit" className="profile-save-button">Save</button>
                                    <button type="button" className="profile-cancel-button" onClick={handleCancel}>Cancel</button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Optional: Display User's Bookings, Cart Items, and Ratings */}
                    {/* You can fetch and display data from other components or backend as needed */}
                </div>
            </div>
        </div>
    );
};

export default Profile;
