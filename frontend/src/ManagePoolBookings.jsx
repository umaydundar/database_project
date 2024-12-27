// ManagePoolBookings.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import './ManagePoolBookings.css';

const ManagePoolBookings = () => {
    const navigate = useNavigate();

    // Mock bookings data for initial display
    const mockBookings = [
        {
            id: 1,
            user: 'John Doe',
            date: '2024-12-30',
            time: '10:00 AM - 12:00 PM',
            pool: 'Main Pool',
            status: 'Confirmed',
        },
        {
            id: 2,
            user: 'Jane Smith',
            date: '2024-12-31',
            time: '2:00 PM - 4:00 PM',
            pool: 'Lap Pool',
            status: 'Pending',
        },
        {
            id: 3,
            user: 'Alice Johnson',
            date: '2025-01-01',
            time: '8:00 AM - 10:00 AM',
            pool: 'Kids Pool',
            status: 'Confirmed',
        },
        {
            id: 4,
            user: 'Bob Brown',
            date: '2025-01-02',
            time: '6:00 PM - 8:00 PM',
            pool: 'Main Pool',
            status: 'Cancelled',
        },
    ];

    // State to hold bookings data
    const [bookings, setBookings] = useState([]);

    // Fetch bookings data on component mount
    useEffect(() => {
        // Initialize bookings with mock data
        const storedBookings = JSON.parse(localStorage.getItem('bookings'));
        if (storedBookings && storedBookings.length > 0) {
            setBookings(storedBookings);
        } else {
            setBookings(mockBookings);
            localStorage.setItem('bookings', JSON.stringify(mockBookings));
        }
    }, []);

    // Handle deleting a booking
    const handleDelete = (bookingId) => {
        if (window.confirm('Are you sure you want to delete this booking?')) {
            const updatedBookings = bookings.filter(booking => booking.id !== bookingId);
            setBookings(updatedBookings);
            localStorage.setItem('bookings', JSON.stringify(updatedBookings));
        }
    };

    // Handle viewing a booking
    const handleViewBooking = (bookingId) => {
        navigate(`/booking/${bookingId}`); // Redirect to a booking details page
    };

    return (
        <div className="manage-pool-bookings-main-container">
            <div className="manage-pool-bookings-bottom-container">
                <Sidebar />
                <div className="manage-pool-bookings-content-container">
                    <h1 className="manage-pool-bookings-heading">Manage Pool Bookings</h1>

                    {/* Bookings Table */}
                    <section className="manage-pool-bookings-section">
                        <h2>All Bookings</h2>
                        <div className="manage-pool-bookings-table-container">
                            <table className="manage-pool-bookings-table">
                                <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>User</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Pool</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {bookings.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="no-bookings">
                                            No bookings found.
                                        </td>
                                    </tr>
                                ) : (
                                    bookings.map(booking => (
                                        <tr key={booking.id}>
                                            <td>{booking.id}</td>
                                            <td>{booking.user}</td>
                                            <td>{booking.date}</td>
                                            <td>{booking.time}</td>
                                            <td>{booking.pool}</td>
                                            <td>{booking.status}</td>
                                            <td>
                                                <button
                                                    onClick={() => handleViewBooking(booking.id)}
                                                    className="manage-pool-bookings-view-button"
                                                >
                                                    View Booking
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(booking.id)}
                                                    className="manage-pool-bookings-delete-button"
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
            </div>
        </div>
    );
};

export default ManagePoolBookings;
