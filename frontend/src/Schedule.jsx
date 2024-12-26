// Schedule.js
import React, { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import './Schedule.css';
import { FaCalendarAlt } from 'react-icons/fa';

const Schedule = () => {
    // Mock takvim verileri
    const weeklySchedule = [
        {
            id: 1,
            day: 'Monday',
            activities: [
                {
                    time: '6:00 AM - 7:30 AM',
                    activity: 'Beginner Swimming',
                    location: 'Main Pool Area',
                },
                {
                    time: '5:00 PM - 6:30 PM',
                    activity: 'Intermediate Swimming',
                    location: 'Main Pool Area',
                },
            ],
        },
        {
            id: 2,
            day: 'Tuesday',
            activities: [
                {
                    time: '6:00 AM - 7:30 AM',
                    activity: 'Beginner Swimming',
                    location: 'Main Pool Area',
                },
                {
                    time: '5:00 PM - 6:30 PM',
                    activity: 'Intermediate Swimming',
                    location: 'Main Pool Area',
                },
            ],
        },
        // Daha fazla gün ekleyebilirsiniz
    ];

    const dailySchedule = [
        {
            id: 1,
            date: '2024-04-28',
            activities: [
                {
                    time: '6:00 AM - 7:30 AM',
                    activity: 'Beginner Swimming',
                    location: 'Main Pool Area',
                },
                {
                    time: '5:00 PM - 6:30 PM',
                    activity: 'Intermediate Swimming',
                    location: 'Main Pool Area',
                },
            ],
        },
        {
            id: 2,
            date: '2024-04-29',
            activities: [
                {
                    time: '6:00 AM - 7:30 AM',
                    activity: 'Beginner Swimming',
                    location: 'Main Pool Area',
                },
                {
                    time: '5:00 PM - 6:30 PM',
                    activity: 'Intermediate Swimming',
                    location: 'Main Pool Area',
                },
            ],
        },
        // Daha fazla günlük program ekleyebilirsiniz
    ];

    const [selectedView, setSelectedView] = useState('weekly'); // 'weekly' veya 'daily'

    // Seçilen görünüme göre verileri belirleme
    const scheduleToDisplay = selectedView === 'weekly' ? weeklySchedule : dailySchedule;

    return (
        <div className="schedule-main-container">
            <div className="schedule-bottom-container">
                <Sidebar />
                <div className="schedule-content-container">
                    <h1>Schedule</h1>

                    {/* Görünüm Seçici */}
                    <div className="view-selector">
                        <button
                            className={`view-btn ${selectedView === 'weekly' ? 'active' : ''}`}
                            onClick={() => setSelectedView('weekly')}
                        >
                            <FaCalendarAlt /> Weekly
                        </button>
                        <button
                            className={`view-btn ${selectedView === 'daily' ? 'active' : ''}`}
                            onClick={() => setSelectedView('daily')}
                        >
                            <FaCalendarAlt /> Daily
                        </button>
                    </div>

                    {/* Takvim Listesi */}
                    <div className="schedule-list">
                        {scheduleToDisplay.map((item) => (
                            <div key={item.id} className="schedule-card">
                                {selectedView === 'weekly' ? (
                                    <>
                                        <h2>{item.day}</h2>
                                        <ul>
                                            {item.activities.map((activity, index) => (
                                                <li key={index}>
                                                    <strong>{activity.time}:</strong> {activity.activity} at {activity.location}
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                ) : (
                                    <>
                                        <h2>{item.date}</h2>
                                        <ul>
                                            {item.activities.map((activity, index) => (
                                                <li key={index}>
                                                    <strong>{activity.time}:</strong> {activity.activity} at {activity.location}
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Schedule;
