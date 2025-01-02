import React, { useState, useEffect } from "react";
import axios from "axios";
import LayoutAdmin from "./LayoutAdmin";
import "./ManageUsers.css";

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    // Fetch users from the backend
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get("http://127.0.0.1:8000/api/users/", {
                    withCredentials: true,
                });
                if (response.status === 200 && Array.isArray(response.data.users)) {
                    setUsers(response.data.users);
                } else {
                    setError("Failed to fetch users.");
                }
            } catch (err) {
                console.error("Error fetching users:", err);
                setError("An error occurred while fetching users.");
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    // Handle deleting a user
    const handleDelete = async (userId) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                // Option A: pass user_id as a query parameter
                const response = await axios.delete(
                    `http://127.0.0.1:8000/api/delete_user/?user_id=${userId}`,
                    {
                        withCredentials: true,
                    }
                );
                if (response.status === 200) {
                    setUsers(users.filter((user) => user.user_id !== userId));
                } else {
                    setError("Failed to delete user.");
                }
            } catch (err) {
                console.error("Error deleting user:", err);
                setError("An error occurred while deleting the user.");
            }
        }
    };

    // (Optional) Handle viewing a user's profile
    const handleViewProfile = (userId) => {
        alert(`View profile for User ID: ${userId}`);
    };

    if (loading) {
        return <div>Loading users...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <LayoutAdmin>
            <div className="manage-users-content-container">
                <h1 className="manage-users-heading">Manage Users</h1>
                <section className="manage-users-section">
                    <h2>All Users</h2>
                    <div className="manage-users-table-container">
                        <table className="manage-users-table">
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Username</th>
                                <th>Role</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {Array.isArray(users) && users.length > 0 ? (
                                users.map((user) => (
                                    <tr key={user.user_id}>
                                        <td>{user.user_id}</td>
                                        <td>{`${user.forename} ${user.surname}`}</td>
                                        <td>{user.username}</td>
                                        <td>{user.user_type}</td>
                                        <td>
                                            <button
                                                onClick={() => handleViewProfile(user.user_id)}
                                                className="manage-users-view-button"
                                            >
                                                View Profile
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.user_id)}
                                                className="manage-users-delete-button"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="no-users">
                                        No users found.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </LayoutAdmin>
    );
};

export default ManageUsers;
