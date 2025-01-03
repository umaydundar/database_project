import React, { useState, useEffect } from 'react';
import Sidebar from './LayoutNonMember.jsx';
import './BookPoolLaneNonMember.css';
import axios from 'axios';

const BookPoolLane = () => {
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedLane, setSelectedLane] = useState('');
    const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
    const [confirmation, setConfirmation] = useState(null);
    const [availableLanes, setAvailableLanes] = useState([]);
    const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Fetch available lanes for the selected date
    const fetchLanes = async (date) => {
        try {
            setLoading(true);
            const response = await axios.get(`http://127.0.0.1:8000/api/get_available_lanes/?date=${date}`);
            setAvailableLanes(response.data.lanes || []);
            setAvailableTimeSlots([]);
            setSelectedLane('');
            setSelectedTimeSlot('');
        } catch (error) {
            console.error('Error fetching lanes:', error);
            setErrorMessage('Failed to fetch available lanes. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch available time slots for the selected lane and date
    const fetchTimeSlots = async (date, lane) => {
        try {
            setLoading(true);
            const response = await axios.get(
                `http://127.0.0.1:8000/api/get_available_time_slots/?date=${date}&lane_id=${lane}`
            );
            setAvailableTimeSlots(response.data.time_slots || []);
        } catch (error) {
            console.error('Error fetching time slots:', error);
            setErrorMessage('Failed to fetch available time slots. Please try again later.');
        } finally {
            setLoading(false);
        }
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

        fetchLanes(date);
    };

    const handleLaneChange = (e) => {
        const lane = e.target.value;
        setSelectedLane(lane);

        if (selectedDate && lane) {
            fetchTimeSlots(selectedDate, lane);
        }
    };

    const handleBooking = async (e) => {
        e.preventDefault();

        if (!selectedDate || !selectedLane || !selectedTimeSlot) {
            alert('Please select a date, lane, and time slot.');
            return;
        }

        try {
            const nonMemberId = localStorage.getItem('nonMemberId');
            if (!nonMemberId) {
                alert('Please log in to book a lane.');
                return;
            }

            const response = await axios.post('http://127.0.0.1:8000/api/book_lane/', {
                swimmer_id: nonMemberId,
                lane_id: selectedLane,
                date: selectedDate,
                start_time: selectedTimeSlot.split(' - ')[0],
                end_time: selectedTimeSlot.split(' - ')[1],
            });

            if (response.status === 201) {
                setConfirmation({
                    date: selectedDate,
                    lane: selectedLane,
                    timeSlot: selectedTimeSlot,
                });
                setSelectedDate('');
                setSelectedLane('');
                setSelectedTimeSlot('');
                setAvailableTimeSlots([]);
                setAvailableLanes([]);
                alert(response.data.message);
            }
        } catch (error) {
            console.error('Error booking lane:', error);
            setErrorMessage('Failed to book lane. Please try again later.');
        }
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
                                disabled={!selectedDate || availableLanes.length === 0 || loading}
                            >
                                <option value="">--Select Lane--</option>
                                {availableLanes.map((lane) => (
                                    <option key={lane.lane_id} value={lane.lane_id}>
                                        Lane {lane.lane_id}
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
                                disabled={!selectedLane || availableTimeSlots.length === 0 || loading}
                            >
                                <option value="">--Select Time Slot--</option>
                                {availableTimeSlots.map((slot, index) => (
                                    <option key={index} value={slot}>
                                        {slot}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button type="submit" className="bookpoollane-submit-button" disabled={loading}>
                            {loading ? 'Booking...' : 'Book Lane'}
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
