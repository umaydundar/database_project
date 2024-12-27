import React, { useState } from 'react';
import Sidebar from './LayoutMember.jsx';
import './ScheduleMember.css';
import { FaCalendarAlt } from 'react-icons/fa';

const Schedule = () => {
    const scheduleDummy = [
        {
            date: '2024-12-22',
            activities: [
                { time: '6:00 AM - 7:30 AM', activity: 'Beginner Swimming', location: 'Main Pool Area' },
                { time: '5:00 PM - 6:30 PM', activity: 'Intermediate Swimming', location: 'Main Pool Area' },
            ],
        },
        {
            date: '2024-12-23',
            activities: [
                { time: '7:00 AM - 8:30 AM', activity: 'Yoga Class', location: 'Fitness Room' },
                { time: '6:00 PM - 7:30 PM', activity: 'Advanced Swimming', location: 'Main Pool Area' },
            ],
        },
        {
            date: '2024-12-24',
            activities: [
                { time: '8:00 AM - 9:30 AM', activity: 'Cardio Training', location: 'Gym' },
                { time: '4:00 PM - 5:30 PM', activity: 'Kids Swimming', location: 'Main Pool Area' },
            ],
        },
        {
            date: '2024-12-25',
            activities: [
                { time: '9:00 AM - 10:30 AM', activity: 'Aqua Aerobics', location: 'Main Pool Area' },
                { time: '5:30 PM - 7:00 PM', activity: 'Meditation', location: 'Yoga Room' },
            ],
        },
        {
            date: '2024-12-26',
            activities: [
                { time: '6:00 AM - 7:30 AM', activity: 'Beginner Swimming', location: 'Main Pool Area' },
                { time: '5:00 PM - 6:30 PM', activity: 'Intermediate Swimming', location: 'Main Pool Area' },
            ],
        },
        {
            date: '2024-12-27',
            activities: [
                { time: '6:00 AM - 7:30 AM', activity: 'Yoga Class', location: 'Fitness Room' },
                { time: '6:00 PM - 7:30 PM', activity: 'Advanced Swimming', location: 'Main Pool Area' },
            ],
        },
        {
            date: '2024-12-28',
            activities: [
                { time: '8:00 AM - 9:30 AM', activity: 'Cardio Training', location: 'Gym' },
                { time: '4:00 PM - 5:30 PM', activity: 'Kids Swimming', location: 'Main Pool Area' },
            ],
        },
        {
            date: '2024-12-29',
            activities: [],
        },
        {
            date: '2024-12-30',
            activities: [
                { time: '9:00 AM - 10:30 AM', activity: 'Aqua Aerobics', location: 'Main Pool Area' },
            ],
        },
        {
            date: '2024-12-31',
            activities: [
                { time: '5:30 PM - 7:00 PM', activity: 'New Year’s Eve Yoga', location: 'Yoga Room' },
            ],
        },
    ];

    const [selectedView, setSelectedView] = useState('daily'); // 'weekly' or 'daily'

    // Helper function to get the day of the week
    const getDayOfWeek = (dateString) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const date = new Date(dateString);
        return days[date.getDay()];
    };

    // Get today's date and day of the week
    const today = new Date();
    const todayISO = today.toISOString().split('T')[0];
    const todayDay = today.getDay(); // 0 (Sunday) to 6 (Saturday)

    // Weekly schedule: Filter for remaining days of the current week
    const weeklySchedule = scheduleDummy
        .filter((item) => {
            const itemDate = new Date(item.date);
            const itemDay = itemDate.getDay();
            return itemDay >= todayDay; // Include only dates from today onward
        })
        .map((item) => ({
            ...item,
            day: getDayOfWeek(item.date),
        }));

    // Daily schedule: Filter for today's date
    const todaySchedule = scheduleDummy.filter((item) => item.date === todayISO);

    // Determine schedule to display based on selected view
    const scheduleToDisplay = selectedView === 'weekly' ? weeklySchedule : todaySchedule;

    return (
        <div className="schedule-main-container">
            <div className="schedule-bottom-container">
                <Sidebar />
                <div className="schedule-content-container">
                    <h1>Schedule</h1>

                    {/* View Selector */}
                    <div className="view-selector">
                        <button
                            className={`view-btn ${selectedView === 'daily' ? 'active' : ''}`}
                            onClick={() => setSelectedView('daily')}
                        >
                            <FaCalendarAlt /> Daily
                        </button>
                        <button
                            className={`view-btn ${selectedView === 'weekly' ? 'active' : ''}`}
                            onClick={() => setSelectedView('weekly')}
                        >
                            <FaCalendarAlt /> Weekly
                        </button>
                    </div>

                    {/* Schedule List */}
                    <div className="schedule-list">
                        {scheduleToDisplay.length > 0 ? (
                            scheduleToDisplay.map((item, index) => (
                                <div key={index} className="schedule-card">
                                    {selectedView === 'weekly' ? (
                                        <>
                                            <h2>{item.day} ({item.date})</h2>
                                            <ul>
                                                {item.activities.length > 0 ? (
                                                    item.activities.map((activity, idx) => (
                                                        <li key={idx}>
                                                            <strong>{activity.time}:</strong> {activity.activity} at {activity.location}
                                                        </li>
                                                    ))
                                                ) : (
                                                    <p>No activities scheduled.</p>
                                                )}
                                            </ul>
                                        </>
                                    ) : (
                                        <>
                                            <h2>{item.date}</h2>
                                            <ul>
                                                {item.activities.length > 0 ? (
                                                    item.activities.map((activity, idx) => (
                                                        <li key={idx}>
                                                            <strong>{activity.time}:</strong> {activity.activity} at {activity.location}
                                                        </li>
                                                    ))
                                                ) : (
                                                    <p>No activities scheduled for today.</p>
                                                )}
                                            </ul>
                                        </>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="no-schedule-message">No schedule available for today.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Schedule;
