import React, { useState, useEffect } from "react";
import LayoutAdmin from "./LayoutAdmin"; // Import LayoutAdmin
import "./ManageUsers.css";

const ManageUsers = () => {
    const mockUsers = [
        {
            id: 1,
            name: "John Doe",
            email: "john.doe@example.com",
            role: "Member",
            points: 150,
        },
        {
            id: 2,
            name: "Jane Smith",
            email: "jane.smith@example.com",
            role: "Admin",
            points: 300,
        },
        {
            id: 3,
            name: "Alice Johnson",
            email: "alice.johnson@example.com",
            role: "Member",
            points: 200,
        },
        {
            id: 4,
            name: "Bob Brown",
            email: "bob.brown@example.com",
            role: "Member",
            points: 120,
        },
        {
            id: 5,
            name: "Sara Lee",
            email: "sara.lee@example.com",
            role: "Admin",
            points: 450,
        },
    ];

    const [users, setUsers] = useState([]);

    useEffect(() => {
        const storedUsers = JSON.parse(localStorage.getItem("users"));
        if (storedUsers && storedUsers.length > 0) {
            setUsers(storedUsers);
        } else {
            setUsers(mockUsers);
            localStorage.setItem("users", JSON.stringify(mockUsers));
        }
    }, []);

    const handleDelete = (userId) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            const updatedUsers = users.filter((user) => user.id !== userId);
            setUsers(updatedUsers);
            localStorage.setItem("users", JSON.stringify(updatedUsers));
        }
    };

    const handleViewProfile = (userId) => {
        alert(`View profile for User ID: ${userId}`);
    };

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
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Points</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="no-users">
                                            No users found.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user.id}>
                                            <td>{user.id}</td>
                                            <td>{user.name}</td>
                                            <td>{user.email}</td>
                                            <td>{user.role}</td>
                                            <td>{user.points}</td>
                                            <td>
                                                <button
                                                    onClick={() => handleViewProfile(user.id)}
                                                    className="manage-users-view-button"
                                                >
                                                    View Profile
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="manage-users-delete-button"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
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
