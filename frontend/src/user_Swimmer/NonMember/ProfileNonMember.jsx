import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "./LayoutNonMember.jsx";
import "./ProfileNonMember.css";
import { useNavigate } from "react-router-dom";

const Profile = () => {
    const [userData, setUserData] = useState(null); // Store user data
    const [isEditing, setIsEditing] = useState(false); // Edit mode toggle
    const [editedData, setEditedData] = useState(null); // Editable user data
    const [passwordVisible, setPasswordVisible] = useState(false); // Password visibility toggle
    const [selectedFile, setSelectedFile] = useState(null); // Selected profile picture file
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(""); // Error message
    const navigate = useNavigate();

    // Fetch profile data
    useEffect(() => {
        const fetchProfile = async () => {
            const userId = localStorage.getItem("userId"); // Get user ID from local storage
            if (!userId) {
                setError("User not logged in.");
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(
                    `http://127.0.0.1:8000/api/get_nonmember/?user_id=${userId}`
                );

                if (response.status === 200 && response.data.user) {
                    setUserData(response.data.user);
                    setEditedData(response.data.user);
                } else {
                    setError("Failed to fetch profile data.");
                }
            }
            catch (err) {
                console.error("Error fetching profile:", err);
                setError("Failed to fetch profile data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "profilePicture" && files && files[0]) {
        const reader = new FileReader();
        reader.onload = (event) => {
            setEditedData({ ...editedData, user_image: event.target.result });
        };
        reader.readAsDataURL(files[0]);
        setSelectedFile(files[0]);
        } else {
        setEditedData({ ...editedData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userId = localStorage.getItem("userId");

        if (!userId) {
            alert("User not logged in.");
            return;
        }

        try {
            const updateData = {
                ...editedData,
                user_id: userId, // Ensure user_id is included
            };

            // If a new profile picture is selected, convert it to Base64
            if (selectedFile) {
                const reader = new FileReader();
                reader.onload = async () => {
                    updateData.user_image = reader.result.split(",")[1]; // Base64 data
                    await sendUpdateRequest(updateData);
                };
                reader.readAsDataURL(selectedFile);
            } else {
                await sendUpdateRequest(updateData);
            }
        } catch (err) {
            console.error("Error updating profile:", err);
            alert("Failed to update profile.");
        }
    };

    const sendUpdateRequest = async (updateData) => {
        try {
            await axios.post(
                "http://127.0.0.1:8000/api/update_nonmember_profile/",
                updateData
            );
            setUserData(editedData);
            setIsEditing(false);
            alert("Profile updated successfully!");
        } catch (err) {
            console.error("Error updating profile:", err);
            alert("Failed to update profile.");
        }
    };

    const handleCancel = () => {
        setEditedData(userData);
        setIsEditing(false);
        setSelectedFile(null);
    };

    const handleLogout = () => {
        localStorage.removeItem("userId");
        alert("Logged out successfully!");
        localStorage.removeItem('userRole');
        localStorage.removeItem('userPoints'); // Clear user points on logout
        localStorage.removeItem('balance'); // Clear balance on logout
        navigate('/');
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="profile-main-container">
        <div className="profile-bottom-container">
            <Sidebar />
            <div className="profile-content-container">
            <h1 className="profile-heading">My Profile</h1>
            <div className="profile-user-info">
                <img
                src={`data:image/png;base64,${userData.user_image}`} // Display Base64 image
                alt="Profile"
                className="profile-picture"
                />
                {!isEditing ? (
                <div className="profile-details">
                    <p><strong>Membership Status: NON-MEMBER</strong></p>
                    <p><strong>Name:</strong> {`${userData.forename} ${userData.surname}`}</p>
                    <p><strong>Email:</strong> {userData.email}</p>
                    <p><strong>Username:</strong> {userData.username}</p>
                    <p>
                    <strong>Password:</strong>
                    <span
                        className="profile-password-toggle"
                        onClick={() => setPasswordVisible(!passwordVisible)}
                    >
                        {passwordVisible ? "Hide" : "Show"}
                    </span>
                    {passwordVisible ? ` ${userData.password}` : " ••••••••"}
                    </p>
                    <button onClick={() => setIsEditing(true)} className="profile-edit-button">
                    Edit Profile
                    </button>
                    <button onClick={handleLogout} className="profile-logout-button">
                    Logout
                    </button>
                </div>
                ) : (
                <form onSubmit={handleSubmit} className="profile-edit-form">
                    <div className="profile-form-group">
                    <label htmlFor="forename">First Name:</label>
                    <input
                        type="text"
                        id="forename"
                        name="forename"
                        value={editedData.forename}
                        onChange={handleChange}
                        required
                    />
                    </div>
                    <div className="profile-form-group">
                    <label htmlFor="surname">Last Name:</label>
                    <input
                        type="text"
                        id="surname"
                        name="surname"
                        value={editedData.surname}
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
                        {passwordVisible ? "Hide" : "Show"}
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
                    {editedData.user_image && (
                        <img
                        src={editedData.user_image}
                        alt="Preview"
                        className="profile-picture-preview"
                        />
                    )}
                    </div>
                    <div className="profile-form-buttons">
                    <button type="submit" className="profile-save-button">
                        Save
                    </button>
                    <button type="button" onClick={handleCancel} className="profile-cancel-button">
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
