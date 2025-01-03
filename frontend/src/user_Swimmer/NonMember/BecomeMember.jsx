import React, { useState } from 'react';
import Sidebar from './LayoutNonMember.jsx';
import './BecomeMember.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection

const Membership = () => {
    const [confirmation, setConfirmation] = useState(false); // Confirmation state
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate(); // Initialize navigate for redirection

    const handleBecomeMember = async () => {
        const userId = localStorage.getItem('nonMemberId');
        if (!userId) {
            setErrorMessage('User not logged in.');
            return;
        }
    
        console.log('User ID:', userId); // Debugging: Log user_id
    
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/become_member/', {
                user_id: userId,
            });
    
            if (response.status === 200) {
                setSuccessMessage('You are now a member!');
                localStorage.removeItem('nonMemberId');
                localStorage.setItem('userType', 'member');

                // Automatically logout and redirect to the login or home page
                setTimeout(() => {
                    localStorage.clear(); // Clear all local storage items
                    alert('You have been logged out. Please log in as a member.');
                    navigate('/'); // Redirect to the home or login page
                }, 2000); // Delay for 2 seconds to show success message
            }
        } catch (error) {
            console.error(
                'Error becoming a member:',
                error.response ? error.response.data : error.message // Log backend error details
            );
            setErrorMessage('Failed to become a member.');
        }
    };
    
    return (
        <div className="membership-main-container">
            <div className="membership-bottom-container">
                <Sidebar />
                <div className="membership-content-container">
                    <h1 className="membership-heading">Become a Member</h1>

                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                    {successMessage ? (
                        <p className="success-message">{successMessage}</p>
                    ) : confirmation ? (
                        <div className="membership-confirmation-box">
                            <p>
                                Are you sure you want to become a member for <strong>100 TL</strong>?
                            </p>
                            <div className="membership-button-group">
                                <button
                                    onClick={handleBecomeMember}
                                    className="membership-submit-button"
                                >
                                    Confirm
                                </button>
                                <button
                                    onClick={() => setConfirmation(false)}
                                    className="membership-cancel-button"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="membership-action-box">
                            <button
                                onClick={() => setConfirmation(true)}
                                className="membership-submit-button"
                            >
                                Become a Member
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Membership;
