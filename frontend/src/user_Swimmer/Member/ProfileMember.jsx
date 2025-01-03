import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "./LayoutMember.jsx";
import "./ProfileMember.css";

const Profile = () => {
    const [userData, setUserData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState(null);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch profile data
    useEffect(() => {
        const fetchProfile = async () => {
            const swimmerId = localStorage.getItem("swimmerId");
            if (!swimmerId) {
                setError("User not logged in.");
                setLoading(false);
                return;
            }

            try {
                // Fetch member data from GetMemberSwimmerView
                const memberResponse = await axios.get(`http://127.0.0.1:8000/api/get_member/?user_id=${swimmerId}`);
                
                // Fetch user data from GetUserView
                const userResponse = await axios.get(`http://127.0.0.1:8000/api/get_user/?user_id=${swimmerId}`);

                if (memberResponse.data.member && userResponse.data.user) {
                    const combinedData = {
                        ...memberResponse.data.member,
                        forename: userResponse.data.user.forename,
                        surname: userResponse.data.user.surname,
                        email: userResponse.data.user.email,
                        username: userResponse.data.user.username, // Retain username
                        userType: userResponse.data.user.user_type, // Retain user type
                        profilePicture: userResponse.data.user.user_image,
                        password: userResponse.data.user.password,
                    };

                    setUserData(combinedData);
                    setEditedData(combinedData);
                    setLoading(false);
                } else {
                    setError("Failed to fetch profile data.");
                    setLoading(false);
                }
            } catch (err) {
                console.error("Error fetching profile:", err);
                setError("Failed to fetch profile data.");
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userId = localStorage.getItem("swimmerId");
        if (!userId) {
            alert("User not logged in.");
            return;
        }

        try {
            // Update user and member data
            await axios.post("http://127.0.0.1:8000/api/update_member_profile/", {
                user_id: userId,
                forename: editedData.forename,
                surname: editedData.surname,
                email: editedData.email,
                password: editedData.password,
                // Explicitly pass unchanged fields
                username: userData.username,
                user_type: userData.userType,
            });

            // Upload profile picture if selected
            if (selectedFile) {
                const formData = new FormData();
                formData.append("user_id", userId);
                formData.append("profilePicture", selectedFile);
                await axios.post("/api/upload_profile_picture/", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }

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
        localStorage.removeItem("swimmerId");
        alert("Logged out successfully!");
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="profile-main-container">
            <div className="profile-bottom-container">
                <Sidebar />
                <div className="profile-content-container">
                    <h1 className="profile-heading">My Profile</h1>

                    <div className="profile-user-info">
                        <img
                            src={userData.profilePicture || "https://via.placeholder.com/150"}
                            alt="Profile"
                            className="profile-picture"
                        />
                        {!isEditing ? (
                            <div className="profile-details">
                                <p><strong>Name:</strong> {`${userData.forename} ${userData.surname}`}</p>
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
