// BookPoolLane.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from './LayoutMember.jsx';
import './BookPoolLaneMember.css';

const BookPoolLane = () => {
    const poolLanes = [1, 2, 3, 4, 5];
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

    // Initialize bookings from localStorage or as an empty array
    const [bookings, setBookings] = useState(() => {
        const savedBookings = localStorage.getItem('bookpoollane-bookings');
        return savedBookings ? JSON.parse(savedBookings) : [];
    });

    const [selectedDate, setSelectedDate] = useState('');
    const [selectedLane, setSelectedLane] = useState('');
    const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
    const [confirmation, setConfirmation] = useState(null);
    const [availableLanes, setAvailableLanes] = useState([]);
    const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');

    // Synchronize bookings with localStorage whenever bookings change
    useEffect(() => {
        localStorage.setItem('bookpoollane-bookings', JSON.stringify(bookings));
    }, [bookings]);

    // Mock availability data
    const availabilityData = {
        '2024-12-05': {
            1: ['06:00 AM - 07:00 AM', '07:00 AM - 08:00 AM'],
            2: ['09:00 AM - 10:00 AM', '10:00 AM - 11:00 AM'],
            3: [],
            4: ['01:00 PM - 02:00 PM'],
            5: ['06:00 PM - 07:00 PM'],
        },
        '2025-01-04': {
            1: ['06:00 AM - 07:00 AM', '07:00 AM - 08:00 AM'],
            2: ['09:00 AM - 10:00 AM', '10:00 AM - 11:00 AM'],
            3: [],
            4: ['01:00 PM - 02:00 PM'],
            5: ['06:00 PM - 07:00 PM'],
        },
        '2025-01-05': {
            1: [],
            2: ['08:00 AM - 09:00 AM', '10:00 AM - 11:00 AM'],
            3: ['11:00 AM - 12:00 PM', '12:00 PM - 01:00 PM'],
            4: [],
            5: ['04:00 PM - 05:00 PM'],
        },
    };

    const handleDateChange = (e) => {
        const date = e.target.value;
        setSelectedDate(date);
        setErrorMessage('');

        if (!date) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDateObj = new Date(date);

        if (selectedDateObj <= today) {
            showError('Please select a date that is at least one day after today.');
            setSelectedDate('');
            return;
        }

        const availableLanesForDate = Object.keys(availabilityData[date] || {}).filter(
            (lane) => availabilityData[date][lane].length > 0
        );

        // Additionally, remove lanes already booked for the selected date
        const bookedLanes = bookings
            .filter((booking) => booking.date === date)
            .map((booking) => booking.lane.toString());

        const finalAvailableLanes = availableLanesForDate.filter(
            (lane) => !bookedLanes.includes(lane)
        );

        if (finalAvailableLanes.length === 0) {
            showError('All lanes are fully booked for this date. Please select another day.');
            setSelectedDate('');
        } else {
            setAvailableLanes(finalAvailableLanes);
            setSelectedLane('');
            setSelectedTimeSlot('');
            setAvailableTimeSlots([]);
        }
    };

    const handleLaneChange = (e) => {
        const lane = e.target.value;
        setSelectedLane(lane);

        if (selectedDate && lane) {
            const slots = availabilityData[selectedDate]?.[lane] || [];
            // Additionally, remove time slots already booked for this lane and date
            const bookedSlots = bookings
                .filter((booking) => booking.date === selectedDate && booking.lane === lane)
                .map((booking) => booking.timeSlot);

            const finalAvailableSlots = slots.filter(
                (slot) => !bookedSlots.includes(slot)
            );

            setAvailableTimeSlots(finalAvailableSlots);
        }
    };

    const handleBooking = (e) => {
        e.preventDefault();

        if (!selectedDate || !selectedLane || !selectedTimeSlot) {
            alert('Please select a date, lane, and time slot.');
            return;
        }

        const newBooking = {
            id: Date.now(),
            date: selectedDate,
            timeSlot: selectedTimeSlot,
            lane: selectedLane,
        };

        setBookings([...bookings, newBooking]);
        setConfirmation(newBooking);

        setSelectedDate('');
        setSelectedLane('');
        setSelectedTimeSlot('');
        setAvailableTimeSlots([]);
        setAvailableLanes([]);
    };

    const showError = (message) => {
        setErrorMessage(message);
        setTimeout(() => {
            setErrorMessage('');
        }, 5000); // Clear the error message after 5 seconds
    };

    return (
        <div className="bookpoollane-main-container">
            <div className="bookpoollane-bottom-container">
                <Sidebar />
                <div className="bookpoollane-content-container">
                    <h1 className="bookpoollane-heading">Book a Pool Lane</h1>

                    <form className="bookpoollane-form" onSubmit={handleBooking}>
                        <div className="bookpoollane-form-group">
                            <label htmlFor="date">Select Date:</label>
                            <input
                                type="date"
                                id="date"
                                value={selectedDate}
                                onChange={handleDateChange}
                                required
                            />
                        </div>
                        {errorMessage && <p className="bookpoollane-error-message">{errorMessage}</p>}

                        <div className="bookpoollane-form-group">
                            <label htmlFor="lane">Select Lane:</label>
                            <select
                                id="lane"
                                value={selectedLane}
                                onChange={handleLaneChange}
                                required
                                disabled={!selectedDate || availableLanes.length === 0}
                            >
                                <option value="">--Select Lane--</option>
                                {availableLanes.map((lane) => (
                                    <option key={lane} value={lane}>
                                        Lane {lane}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="bookpoollane-form-group">
                            <label htmlFor="timeSlot">Select Time Slot:</label>
                            <select
                                id="timeSlot"
                                value={selectedTimeSlot}
                                onChange={(e) => setSelectedTimeSlot(e.target.value)}
                                required
                                disabled={!selectedLane || availableTimeSlots.length === 0}
                            >
                                <option value="">--Select Time Slot--</option>
                                {availableTimeSlots.map((slot, index) => (
                                    <option key={index} value={slot}>
                                        {slot}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button type="submit" className="bookpoollane-submit-button">
                            Book Lane
                        </button>
                    </form>

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
                                <strong>Lane:</strong> Lane {confirmation.lane}
                            </p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default BookPoolLane;
