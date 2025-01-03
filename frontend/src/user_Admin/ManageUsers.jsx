import React, { useState, useEffect } from "react";
import axios from "axios";
import LayoutAdmin from "./LayoutAdmin";
import "./ManageUsers.css";

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    // Modal state'leri
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

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

    // "View Profile" butonuna tıklayınca modal'ı açar ve seçili kullanıcıyı kaydeder
    const handleViewProfile = (userId) => {
        const foundUser = users.find((user) => user.user_id === userId);
        if (foundUser) {
            setSelectedUser(foundUser);
            setShowModal(true);
        }
    };

    // Modal'ı kapatma fonksiyonu
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedUser(null);
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

                {/* Modal */}
                {showModal && selectedUser && (
                    <div className="users-modal-overlay">
                        <div className="users-modal-content">
                            <h2>User Details</h2>
                            <p><strong>ID:</strong> {selectedUser.user_id}</p>
                            <p><strong>Name:</strong> {`${selectedUser.forename} ${selectedUser.surname}`}</p>
                            <p><strong>Username:</strong> {selectedUser.username}</p>
                            <p><strong>Role:</strong> {selectedUser.user_type}</p>

                            {/* Burada istediğiniz ek alanları da gösterebilirsiniz
                                Örneğin: user_image, email vb.
                                <p><strong>Email:</strong> {selectedUser.email}</p>
                            */}

                            <button onClick={handleCloseModal} className="close-modal-button">
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </LayoutAdmin>
    );
};

export default ManageUsers;