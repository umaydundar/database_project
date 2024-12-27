import React, { useState } from "react";
import LayoutCoach from "./LayoutCoach"; // Import the Sidebar layout
import "./ScheduleCoach.css";

const ScheduleCoach = () => {
    const [selectedView, setSelectedView] = useState("daily");

    const scheduleDummy = [
        {
            date: "2024-12-22",
            activities: [
                { time: "6:00 AM - 7:30 AM", activity: "Beginner Swimming", location: "Main Pool Area" },
                { time: "5:00 PM - 6:30 PM", activity: "Intermediate Swimming", location: "Main Pool Area" },
            ],
        },
        // Add more dummy schedules
    ];

    const today = new Date().toISOString().split("T")[0];
    const filteredSchedules =
        selectedView === "daily"
            ? scheduleDummy.filter((schedule) => schedule.date === today)
            : scheduleDummy; // For weekly, show all

    return (
        <LayoutCoach> {/* Render the sidebar explicitly */}
            <div className="schedule-content">
                <h1>Schedule</h1>
                <div className="view-selector">
                    <button
                        className={`view-btn ${selectedView === "daily" ? "active" : ""}`}
                        onClick={() => setSelectedView("daily")}
                    >
                        Daily
                    </button>
                    <button
                        className={`view-btn ${selectedView === "weekly" ? "active" : ""}`}
                        onClick={() => setSelectedView("weekly")}
                    >
                        Weekly
                    </button>
                </div>
                <div className="schedule-list">
                    {filteredSchedules.length > 0 ? (
                        filteredSchedules.map((schedule, index) => (
                            <div key={index} className="schedule-card">
                                <h2>{schedule.date}</h2>
                                <ul>
                                    {schedule.activities.map((activity, idx) => (
                                        <li key={idx}>
                                            <strong>{activity.time}:</strong> {activity.activity} - {activity.location}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))
                    ) : (
                        <p>No schedules available for this view.</p>
                    )}
                </div>
            </div>
        </LayoutCoach>
    );
};

export default ScheduleCoach;
