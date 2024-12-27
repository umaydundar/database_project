// Ratings.jsx
import React, { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import './Ratings.css';
import { useNavigate } from 'react-router-dom';

const Ratings = () => {
    // Mock data for Best Rated Coaches
    const initialCoaches = [
        {
            id: 1,
            name: 'Alice Johnson',
            expertise: 'Freestyle Techniques',
            averageRating: 4.9,
            reviews: [],
            profileLink: '/coach-profile/1', // Assuming you have routes for coach profiles
        },
        {
            id: 2,
            name: 'Bob Brown',
            expertise: 'Backstroke Mastery',
            averageRating: 4.7,
            reviews: [],
            profileLink: '/coach-profile/2',
        },
        // Add more coaches as needed
    ];

    const [coaches, setCoaches] = useState(initialCoaches);
    const navigate = useNavigate();

    // Handle navigating to the coach's profile
    const handleSeeProfile = (profileLink) => {
        navigate(profileLink);
    };

    return (
        <div className="ratings-main-container">
            <div className="ratings-bottom-container">
                <Sidebar />
                <div className="ratings-content-container">
                    <h1 className="ratings-heading">Best Rated Coaches</h1>

                    <section className="ratings-section">
                        <div className="ratings-list">
                            {coaches
                                .sort((a, b) => b.averageRating - a.averageRating)
                                .map(coach => (
                                    <div key={coach.id} className="ratings-list-item">
                                        <div className="ratings-item-details">
                                            <h3>{coach.name}</h3>
                                            <p><strong>Expertise:</strong> {coach.expertise}</p>
                                            <p><strong>Average Rating:</strong> {coach.averageRating} / 5</p>
                                        </div>
                                        <button
                                            className="ratings-see-profile-button"
                                            onClick={() => handleSeeProfile(coach.profileLink)}
                                        >
                                            See Profile
                                        </button>
                                    </div>
                                ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Ratings;
