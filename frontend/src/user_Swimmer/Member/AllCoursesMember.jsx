import React, { useState, useEffect } from 'react';
import Sidebar from './LayoutMember.jsx'; // Member-specific Sidebar
import './AllCoursesMember.css'; // Member-specific styles
import { FaEye } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";

const AllCoursesMember = () => {
    
    const navigate = useNavigate();
    const [allCourses, setAllCourses] = useState([]); // State to store courses fetched from the backend
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [error, setError] = useState(null);

    // Fetch courses from the backend on component mount
    useEffect(() => {
        const fetchCourses = async () => {
            const memberId = localStorage.getItem('userId'); // Get member ID from local storage
            if (!memberId) {
                setError('Member ID is missing. Please log in again.');
                return;
            }

            try {
                const response = await fetch(`http://127.0.0.1:8000/api/all_courses/?swimmer_id=${memberId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch courses.');
                }
                const data = await response.json();
                setAllCourses(data.courses || []);
            } catch (err) {
                console.error('Error fetching courses:', err);
                setError('Unable to load courses. Please try again later.');
            }
        };

        fetchCourses();
    }, []);

    const handleDetailsClick = (course) => {
        setSelectedCourse(course);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCourse(null);
    };

    // Handle enrollment by sending a POST request to the backend
    const handleEnroll = async (course) => {
        const memberId = localStorage.getItem('userId');

        if (!memberId) {
            alert('Please log in to enroll in a course.');
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/api/enroll_course/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    swimmer_id: memberId,
                    course_id: course.course_id,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                alert(data.message || 'Successfully enrolled in the course.');
                // Optionally, refresh the courses list after enrollment
            } else {
                const errorData = await response.json();
                alert(errorData.error || 'Failed to enroll in the course.');
            }
        } catch (error) {
            console.error('Error enrolling in the course:', error);
            alert('An error occurred while enrolling in the course.');
        }
    };

    return (
        <div className="allcourses-main-container">
            <div className="allcourses-bottom-container">
                <Sidebar />
                <div className="allcourses-content-container">
                    <h1 className="allcourses-heading">All Courses</h1>

                    {error && <p className="error-message">{error}</p>}

                    {/* Courses List */}
                    <div className="allcourses-courses-list">
                        {allCourses.map((course) => (
                            <div key={course.course_id} className="allcourses-course-card">
                                <div className="allcourses-course-header">
                                    <h2>{course.course_name}</h2>
                                </div>
                                <div className="allcourses-course-brief">
                                    <p>
                                        <strong>Instructor:</strong> {course.coach_id}
                                    </p>
                                    <p>
                                        <strong>Registered:</strong> {course.registered}
                                    </p>
                                    <p>
                                        <strong>Deadline:</strong> {course.deadline}
                                    </p>
                                    <p>
                                        <strong>Price:</strong> {course.price} TL
                                    </p>
                                    <p>
                                        <strong>Restrictions:</strong> {course.restrictions || 'None'}
                                    </p>
                                </div>
                                <div className="allcourses-course-actions">
                                    <button
                                        className="allcourses-details-button"
                                        onClick={() => handleDetailsClick(course)}
                                    >
                                        <FaEye /> Details
                                    </button>
                                    {course.is_full ? (
                                        <button className="allcourses-enroll-button full" disabled>
                                            Full
                                        </button>
                                    ) : (
                                        <button
                                            className="allcourses-enroll-button"
                                            onClick={() => handleEnroll(course)}
                                        >
                                            Enroll
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && selectedCourse && (
                <div className="allcourses-modal-overlay" onClick={handleCloseModal}>
                    <div className="allcourses-modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{selectedCourse.course_name}</h2>
                        <p>
                            <strong>Instructor:</strong> {selectedCourse.coach_id}
                        </p>
                        <p>
                            <strong>Description:</strong> {selectedCourse.course_description}
                        </p>
                        <p>
                            <strong>Registered:</strong> {selectedCourse.registered}
                        </p>
                        <p>
                            <strong>Price:</strong> {selectedCourse.price} TL
                        </p>
                        <p>
                            <strong>Restrictions:</strong> {selectedCourse.restrictions || 'None'}
                        </p>
                        <div className="allcourses-modal-buttons">
                            <button className="allcourses-close-button" onClick={handleCloseModal}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllCoursesMember;