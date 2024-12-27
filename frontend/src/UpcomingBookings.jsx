// UpcomingBookings.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar.jsx';
import './UpcomingBookings.css';

const UpcomingBookings = () => {
    const [bookings, setBookings] = useState([]);

    // Fetch bookings from localStorage on component mount
    useEffect(() => {
        const savedBookings = localStorage.getItem('bookpoollane-bookings');
        if (savedBookings) {
            const parsedBookings = JSON.parse(savedBookings);
            setBookings(parsedBookings);
        }
    }, []);

    // Handle canceling a booking
    const handleCancelBooking = (id) => {
        if (window.confirm('Are you sure you want to cancel this booking?')) {
            const updatedBookings = bookings.filter((booking) => booking.id !== id);
            setBookings(updatedBookings);
            localStorage.setItem('bookpoollane-bookings', JSON.stringify(updatedBookings));
            alert('Booking canceled successfully!');
        }
    };

    // Filter upcoming bookings
    const upcomingBookings = bookings.filter((booking) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const bookingDate = new Date(booking.date);
        return bookingDate >= today;
    });

    // Sort bookings by date and time
    upcomingBookings.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (dateA === dateB) {
            // Assuming time slots are in the format 'HH:MM AM/PM - HH:MM AM/PM'
            const timeA = a.timeSlot.split(' - ')[0];
            const timeB = b.timeSlot.split(' - ')[0];
            return convertTimeTo24(timeA) - convertTimeTo24(timeB);
        }
        return dateA - dateB;
    });

    // Helper function to convert time to 24-hour format
    const convertTimeTo24 = (timeStr) => {
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':');
        if (modifier === 'PM' && hours !== '12') {
            hours = parseInt(hours, 10) + 12;
        }
        if (modifier === 'AM' && hours === '12') {
            hours = '00';
        }
        return parseInt(`${hours}${minutes}`, 10);
    };

    return (
        <div className="upcomingbookings-main-container">
            <div className="upcomingbookings-bottom-container">
                <Sidebar />
                <div className="upcomingbookings-content-container">
                    <h1 className="upcomingbookings-heading">Upcoming Bookings</h1>

                    {upcomingBookings.length > 0 ? (
                        <div className="upcomingbookings-bookings-list">
                            <table className="upcomingbookings-table">
                                <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Time Slot</th>
                                    <th>Lane</th>
                                    <th>Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                {upcomingBookings.map((booking) => (
                                    <tr key={booking.id}>
                                        <td>{booking.date}</td>
                                        <td>{booking.timeSlot}</td>
                                        <td>Lane {booking.lane}</td>
                                        <td>
                                            <button
                                                className="upcomingbookings-cancel-button"
                                                onClick={() => handleCancelBooking(booking.id)}
                                            >
                                                Cancel
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="upcomingbookings-no-bookings">You have no upcoming bookings.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UpcomingBookings;
