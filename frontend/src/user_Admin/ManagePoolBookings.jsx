import React, { useState, useEffect } from "react";
import LayoutAdmin from "./LayoutAdmin";
import "./ManagePoolBookings.css";

const ManagePoolBookings = () => {
    const [bookings, setBookings] = useState([]);

    // Modal kontrolü için eklenen state'ler
    const [showModal, setShowModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await fetch("http://127.0.0.1:8000/api/upcoming_bookings/");
                if (response.ok) {
                    const data = await response.json();
                    const rawBookings = data.upcoming_bookings;

                    const formattedBookings = rawBookings.map((item) => {
                        const [datePart, timePart] = item.booking_time.split("T");
                        const date = datePart;
                        const time = timePart ? timePart.substring(0, 5) : "N/A";

                        return {
                            id: item.booking_id,
                            user: `User #${item.user_id}`,
                            date: date,
                            time: time,
                            pool: `Pool #${item.pool_id}`,
                            status: "Upcoming",
                        };
                    });

                    setBookings(formattedBookings);
                } else {
                    console.error("Error fetching bookings:", response.statusText);
                }
            } catch (error) {
                console.error("Error fetching bookings:", error);
            }
        };

        fetchBookings();
    }, []);

    const handleDelete = async (bookingId) => {
        if (window.confirm("Are you sure you want to delete this booking?")) {
            console.log("Attempting to delete booking with ID:", bookingId);
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/delete_private_booking/`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        // Include Authorization header if necessary
                        // "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify({ private_booking_id: bookingId }),
                    // Include credentials if using session-based auth
                    // credentials: 'include',
                });

                const data = await response.json();

                if (response.ok) {
                    setBookings(bookings.filter((booking) => booking.id !== bookingId));
                    alert("Booking deleted successfully.");
                } else {
                    console.error("Error deleting booking:", data.error || response.statusText);
                    alert(`Error deleting booking: ${data.error || 'Unknown error.'}`);
                }
            } catch (error) {
                console.error("Network or unexpected error deleting booking:", error);
                alert("An unexpected error occurred while deleting the booking.");
            }
        }
    };


    // "View Booking" tıklandığında seçilen rezervasyonun bilgilerini modalda göstermek
    const handleViewBooking = (bookingId) => {
        const booking = bookings.find((b) => b.id === bookingId);
        setSelectedBooking(booking);
        setShowModal(true);
    };

    // Modalı kapatmak için basit bir fonksiyon
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedBooking(null);
    };

    return (
        <LayoutAdmin>
            <div className="manage-pool-bookings-content-container">
                <h1 className="manage-pool-bookings-heading">Manage Pool Bookings</h1>

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
                                bookings.map((booking) => (
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

            {/* Modal Yapısı */}
            {showModal && selectedBooking && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Booking Details</h2>
                        <p><strong>ID:</strong> {selectedBooking.id}</p>
                        <p><strong>User:</strong> {selectedBooking.user}</p>
                        <p><strong>Date:</strong> {selectedBooking.date}</p>
                        <p><strong>Time:</strong> {selectedBooking.time}</p>
                        <p><strong>Pool:</strong> {selectedBooking.pool}</p>
                        <p><strong>Status:</strong> {selectedBooking.status}</p>
                        <button onClick={handleCloseModal} className="modal-close-button">
                            Close
                        </button>
                    </div>
                </div>
            )}
        </LayoutAdmin>
    );
};

export default ManagePoolBookings;