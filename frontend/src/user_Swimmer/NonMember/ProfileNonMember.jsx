import React, { useState } from 'react';
import Sidebar from './LayoutNonMember.jsx';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './ProfileNonMember.css';

const Profile = () => {
    const initialUserData = {
        name: 'John Doe',
        email: 'johndoe@example.com',
        profilePicture: 'https://via.placeholder.com/150',
        password: 'password123',
    };

    const [userData, setUserData] = useState(initialUserData);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState(initialUserData);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'profilePicture' && files && files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setEditedData({ ...editedData, profilePicture: event.target.result });
            };
            reader.readAsDataURL(files[0]);
            setSelectedFile(files[0]);
        } else {
            setEditedData({ ...editedData, [name]: value });
        }
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        setUserData(editedData);
        setIsEditing(false);

        // Optional: Save the uploaded file to the server
        if (selectedFile) {
            const formData = new FormData();
            formData.append('profilePicture', selectedFile);

            // Example API call to upload the image
            // fetch('/api/upload', {
            //     method: 'POST',
            //     body: formData,
            // }).then(() => alert('Profile updated successfully!'));
        } else {
            alert('Profile updated successfully!');
        }
    };

    // Handle cancel editing
    const handleCancel = () => {
        setEditedData(userData);
        setIsEditing(false);
        setSelectedFile(null);
    };

    const handleLogout = () => {
        alert('Logged out successfully!');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userPoints'); // Clear user points on logout
        localStorage.removeItem('balance'); // Clear balance on logout
        navigate('/'); // Redirect to Home or Login page
    };

    return (
        <div className="profile-main-container">
            <div className="profile-bottom-container">
                <Sidebar />
                <div className="profile-content-container">
                    <h1 className="profile-heading">My Profile</h1>

                    <div className="profile-user-info">
                        <img
                            src={userData.profilePicture}
                            alt="Profile"
                            className="profile-picture"
                        />
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
                                <div className="profile-form-group">
                                    <label htmlFor="profilePicture">Profile Picture:</label>
                                    <input
                                        type="file"
                                        id="profilePicture"
                                        name="profilePicture"
                                        accept="image/*"
                                        onChange={handleChange}
                                    />
                                    {editedData.profilePicture && (
                                        <img
                                            src={editedData.profilePicture}
                                            alt="Preview"
                                            className="profile-picture-preview"
                                        />
                                    )}
                                </div>
                                <div className="profile-form-buttons">
                                    <button type="submit" className="profile-save-button">Save</button>
                                    <button
                                        type="button"
                                        className="profile-cancel-button"
                                        onClick={handleCancel}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
