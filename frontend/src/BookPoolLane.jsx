// BookPoolLane.jsx
import React, { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import './BookPoolLane.css';

const BookPoolLane = () => {
    // Mock data for pool lanes and time slots
    const poolLanes = [1, 2, 3, 4, 5]; // Example lane numbers
    const timeSlots = [
        '06:00 AM - 07:00 AM',
        '07:00 AM - 08:00 AM',
        '08:00 AM - 09:00 AM',
        '09:00 AM - 10:00 AM',
        '10:00 AM - 11:00 AM',
        '11:00 AM - 12:00 PM',
        '12:00 PM - 01:00 PM',
        '01:00 PM - 02:00 PM',
        '02:00 PM - 03:00 PM',
        '03:00 PM - 04:00 PM',
        '04:00 PM - 05:00 PM',
        '05:00 PM - 06:00 PM',
        '06:00 PM - 07:00 PM',
        '07:00 PM - 08:00 PM',
        '08:00 PM - 09:00 PM',
    ];

    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
    const [selectedLane, setSelectedLane] = useState('');
    const [bookings, setBookings] = useState([]); // Stores all bookings
    const [confirmation, setConfirmation] = useState(null);

    // Handle form submission
    const handleBooking = (e) => {
        e.preventDefault();

        // Validate inputs
        if (!selectedDate || !selectedTimeSlot || !selectedLane) {
            alert('Please select a date, time slot, and lane.');
            return;
        }

        // Check if the selected lane and time slot on the selected date is already booked
        const isAlreadyBooked = bookings.some(
            (booking) =>
                booking.date === selectedDate &&
                booking.timeSlot === selectedTimeSlot &&
                booking.lane === selectedLane
        );

        if (isAlreadyBooked) {
            alert('This lane and time slot are already booked. Please choose another.');
            return;
        }

        // Create a new booking
        const newBooking = {
            id: Date.now(),
            date: selectedDate,
            timeSlot: selectedTimeSlot,
            lane: selectedLane,
        };

        // Update bookings state
        setBookings([...bookings, newBooking]);

        // Set confirmation message
        setConfirmation(newBooking);

        // Reset form
        setSelectedDate('');
        setSelectedTimeSlot('');
        setSelectedLane('');
    };

    return (
        <div className="bookpoollane-main-container">
            <div className="bookpoollane-bottom-container">
                <Sidebar />
                <div className="bookpoollane-content-container">
                    <h1 className="bookpoollane-heading">Book a Pool Lane</h1>

                    {/* Booking Form */}
                    <form className="bookpoollane-form" onSubmit={handleBooking}>
                        <div className="bookpoollane-form-group">
                            <label htmlFor="date">Select Date:</label>
                            <input
                                type="date"
                                id="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                required
                            />
                        </div>

                        <div className="bookpoollane-form-group">
                            <label htmlFor="timeSlot">Select Time Slot:</label>
                            <select
                                id="timeSlot"
                                value={selectedTimeSlot}
                                onChange={(e) => setSelectedTimeSlot(e.target.value)}
                                required
                            >
                                <option value="">--Select Time Slot--</option>
                                {timeSlots.map((slot, index) => (
                                    <option key={index} value={slot}>
                                        {slot}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="bookpoollane-form-group">
                            <label htmlFor="lane">Select Lane:</label>
                            <select
                                id="lane"
                                value={selectedLane}
                                onChange={(e) => setSelectedLane(e.target.value)}
                                required
                            >
                                <option value="">--Select Lane--</option>
                                {poolLanes.map((lane) => (
                                    <option key={lane} value={lane}>
                                        Lane {lane}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button type="submit" className="bookpoollane-submit-button">
                            Book Lane
                        </button>
                    </form>

                    {/* Confirmation Message */}
                    {confirmation && (
                        <div className="bookpoollane-confirmation">
                            <h2>Booking Confirmed!</h2>
                            <p>
                                <strong>Date:</strong> {confirmation.date}
                            </p>
                            <p>
                                <strong>Time Slot:</strong> {confirmation.timeSlot}
                            </p>
                            <p>
                                <strong>Lane:</strong> {confirmation.lane}
                            </p>
                        </div>
                    )}

                    {/* Bookings List */}
                    {bookings.length > 0 && (
                        <div className="bookpoollane-bookings-list">
                            <h2>Upcoming Bookings</h2>
                            <table className="bookpoollane-table">
                                <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Time Slot</th>
                                    <th>Lane</th>
                                </tr>
                                </thead>
                                <tbody>
                                {bookings.map((booking) => (
                                    <tr key={booking.id}>
                                        <td>{booking.date}</td>
                                        <td>{booking.timeSlot}</td>
                                        <td>Lane {booking.lane}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookPoolLane;
