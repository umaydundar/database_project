import React, { useState } from "react";
import LayoutLifeguard from "./LayoutLifeguard"; // Ensure correct path
import "./UpcomingHours.css";

const UpcomingHours = () => {
    // Dummy data for upcoming working hours
    const dummyWorkingHours = [
        {
            id: 1,
            date: "2024-12-28",
            time: "8:00 AM - 10:00 AM",
            facility: "Facility 1",
        },
        {
            id: 2,
            date: "2024-12-28",
            time: "10:00 AM - 12:00 PM",
            facility: "Facility 2",
        },
        {
            id: 3,
            date: "2024-12-29",
            time: "4:00 PM - 6:00 PM",
            facility: "Facility 1",
        },
    ];

    const today = new Date().toISOString().split("T")[0];
    const [upcomingHours, setUpcomingHours] = useState(
        dummyWorkingHours.filter((hour) => hour.date >= today)
    );

    // Handle cancellation of working hours
    const handleCancel = (id) => {
        const updatedHours = upcomingHours.filter((hour) => hour.id !== id);
        setUpcomingHours(updatedHours);
        alert("The selected working hour has been canceled.");
    };

    return (
        <LayoutLifeguard>
            <div className="upcoming-hours-container">
                <h1 className="upcoming-hours-heading">Upcoming Working Hours</h1>

                <div className="working-hours-list">
                    {upcomingHours.length > 0 ? (
                        upcomingHours.map((hour) => (
                            <div key={hour.id} className="working-hour-item">
                                <div className="working-hour-info">
                                    <p>
                                        <strong>Date:</strong> {hour.date}
                                    </p>
                                    <p>
                                        <strong>Time:</strong> {hour.time}
                                    </p>
                                    <p>
                                        <strong>Facility:</strong> {hour.facility}
                                    </p>
                                </div>
                                <div className="working-hour-actions">
                                    <button
                                        className="cancel-button"
                                        onClick={() => handleCancel(hour.id)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-working-hours-message">
                            No upcoming working hours scheduled.
                        </p>
                    )}
                </div>
            </div>
        </LayoutLifeguard>
    );
};

export default UpcomingHours;
