import React, { useState, useEffect } from "react";
import Sidebar from "./LayoutNonMember.jsx";
import "./ScheduleNonMember.css";
import { FaCalendarAlt } from "react-icons/fa";
import axios from "axios";

const Schedule = () => {
    const [selectedView, setSelectedView] = useState("daily");
    const [scheduleData, setScheduleData] = useState({ daily: [], weekly: [] });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSchedule = async () => {
            const nonMemberId = localStorage.getItem("nonMemberId");
            if (!nonMemberId) {
                setError("Nonmember ID is missing. Please log in again.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const [dailyResponse, weeklyResponse] = await Promise.all([
                    axios.get(`http://127.0.0.1:8000/api/nonmember_swimmer_schedule_daily/?nonmember_id=${nonMemberId}`),
                    axios.get(`http://127.0.0.1:8000/api/nonmember_swimmer_schedule_weekly/?nonmember_id=${nonMemberId}`)
                ]);

                setScheduleData({
                    daily: dailyResponse.data.daily_courses || [],
                    weekly: weeklyResponse.data.weekly_courses || [],
                });
                setError(null);
            } catch (err) {
                console.error("Error fetching schedule:", err);
                setError("Failed to fetch schedule. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchSchedule();
    }, []);

    const scheduleToDisplay = selectedView === "daily" ? scheduleData.daily : scheduleData.weekly;

    return (
        <div className="schedule-main-container">
            <div className="schedule-bottom-container">
                <Sidebar />
                <div className="schedule-content-container">
                    <h1>Schedule</h1>

                    {/* View Selector */}
                    <div className="view-selector">
                        <button
                            className={`view-btn ${selectedView === "daily" ? "active" : ""}`}
                            onClick={() => setSelectedView("daily")}
                        >
                            <FaCalendarAlt /> Daily
                        </button>
                        <button
                            className={`view-btn ${selectedView === "weekly" ? "active" : ""}`}
                            onClick={() => setSelectedView("weekly")}
                        >
                            <FaCalendarAlt /> Weekly
                        </button>
                    </div>

                    {/* Schedule List */}
                    <div className="schedule-list">
                        {loading ? (
                            <p>Loading schedule...</p>
                        ) : error ? (
                            <p className="error-message">{error}</p>
                        ) : scheduleToDisplay.length > 0 ? (
                            scheduleToDisplay.map((course, index) => (
                                <div key={index} className="schedule-card">
                                    <h2>{course.course_name}</h2>
                                    <p><strong>Description:</strong> {course.course_description}</p>
                                    <p><strong>Time:</strong> {course.start_time} - {course.end_time}</p>
                                    <p><strong>Day:</strong> {course.day}</p>
                                    <p><strong>Location:</strong> Pool {course.pool_id}, Lane {course.lane_id}</p>
                                    <p><strong>Price:</strong> ${course.price}</p>
                                </div>
                            ))
                        ) : (
                            <p>No schedule available for {selectedView} view.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Schedule;
