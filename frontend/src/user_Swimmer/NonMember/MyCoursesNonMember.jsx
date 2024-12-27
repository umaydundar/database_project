// MyCourses.jsx
import React, { useState } from 'react';
import Sidebar from './LayoutNonMember.jsx';
import './MyCoursesNonMember.css';
import { FaEye, FaStar } from 'react-icons/fa';

const MyCourses = () => {
    // Mock data - Current and Previous Swimming Courses
    const currentCourses = [
        {
            id: 1,
            title: 'Beginner Swimming',
            description: 'Learn the basics of swimming, including freestyle, backstroke, and water safety.',
            instructor: 'John Doe',
            duration: '8 weeks',
            poolLocation: 'Main Pool Area',
            schedule: 'Mondays and Wednesdays, 6:00 PM - 7:30 PM',
            restrictions: 'Must be able to swim at least 25 meters.',
            capacity: '20 participants',
            announcements: 'New swimming goggles available for purchase.',
        },
        {
            id: 2,
            title: 'Intermediate Swimming',
            description: 'Improve your swimming techniques and endurance with advanced drills and workouts.',
            instructor: 'Jane Smith',
            duration: '6 weeks',
            poolLocation: 'Main Pool Area',
            schedule: 'Tuesdays and Thursdays, 5:00 PM - 6:30 PM',
            restrictions: 'Must complete Beginner Swimming course or equivalent.',
            capacity: '15 participants',
            announcements: 'Coach Jane will be joining us for the first session.',
        },
    ];

    const previousCourses = [
        {
            id: 3,
            title: 'Advanced Swimming Techniques',
            description: 'Master advanced swimming techniques and competitive strategies.',
            instructor: 'Alice Johnson',
            duration: '10 weeks',
            poolLocation: 'Olympic Pool',
            schedule: 'Fridays, 4:00 PM - 6:00 PM',
            restrictions: 'Must have completed Intermediate Swimming course.',
            capacity: '10 participants',
            announcements: 'Final course of the season.',
        },
        {
            id: 4,
            title: 'Water Aerobics',
            description: 'Engage in low-impact, high-efficiency workouts in the water to improve fitness and flexibility.',
            instructor: 'Bob Brown',
            duration: '12 weeks',
            poolLocation: 'Fitness Pool',
            schedule: 'Saturdays, 9:00 AM - 10:30 AM',
            restrictions: 'Open to all fitness levels.',
            capacity: '25 participants',
            announcements: 'Bring your own water bottle.',
        },
        // Add more previous courses as needed
    ];

    const [selectedCategory, setSelectedCategory] = useState('current'); // 'current' or 'previous'
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [terminationReason, setTerminationReason] = useState('');
    const [ratings, setRatings] = useState({}); // Stores ratings for previous courses

    // Determine courses to display based on selected category
    const coursesToDisplay = selectedCategory === 'current' ? currentCourses : previousCourses;

    // Handle opening the modal with the selected course
    const handleViewClick = (course) => {
        setSelectedCourse(course);
        setIsModalOpen(true);
    };

    // Handle closing the modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCourse(null);
        setTerminationReason('');
    };

    // Handle Withdraw Course action
    const handleWithdraw = () => {
        if (terminationReason.trim() === '') {
            alert('Please provide a termination reason.');
            return;
        }
        // Implement your withdrawal logic here
        alert(`Course "${selectedCourse.title}" has been withdrawn.\nReason: ${terminationReason}`);
        handleCloseModal();
    };

    // Handle Mark as Done action
    const handleMarkAsDone = () => {
        // Implement your mark as done logic here
        alert(`Course "${selectedCourse.title}" has been marked as done.`);
        handleCloseModal();
    };

    // Handle Rating Click
    const handleRatingClick = (courseId, rating) => {
        setRatings((prevRatings) => ({
            ...prevRatings,
            [courseId]: rating,
        }));
        alert(`You rated "${getCourseTitle(courseId)}" with ${rating} star(s).`);
        // Implement your rating submission logic here (e.g., API call)
    };

    // Helper to get course title by ID
    const getCourseTitle = (courseId) => {
        const course = [...currentCourses, ...previousCourses].find((c) => c.id === courseId);
        return course ? course.title : '';
    };

    return (
        <div className="main-container">
            <div className="bottom-container">
                <Sidebar />
                <div className="content-container">
                    <h1>My Courses</h1>

                    {/* Category Selector */}
                    <div className="category-selector">
                        <button
                            className={`category-btn ${selectedCategory === 'current' ? 'active' : ''}`}
                            onClick={() => setSelectedCategory('current')}
                        >
                            Current Courses
                        </button>
                        <button
                            className={`category-btn ${selectedCategory === 'previous' ? 'active' : ''}`}
                            onClick={() => setSelectedCategory('previous')}
                        >
                            Previous Courses
                        </button>
                    </div>

                    {/* Courses List */}
                    <div className="courses-list">
                        {coursesToDisplay.map((course) => (
                            <div key={course.id} className="course-card">
                                <div className="course-header">
                                    <h2>{course.title}</h2>
                                </div>
                                <div className="course-details">
                                    <p><strong>Description:</strong> {course.description}</p>
                                    <p><strong>Instructor:</strong> {course.instructor}</p>
                                    <p><strong>Duration:</strong> {course.duration}</p>
                                    <p><strong>Pool Location:</strong> {course.poolLocation}</p>
                                    <p><strong>Schedule:</strong> {course.schedule}</p>
                                </div>
                                <div className="course-actions">
                                    {selectedCategory === 'current' ? (
                                        <button className="view-button" onClick={() => handleViewClick(course)}>
                                            <FaEye /> View
                                        </button>
                                    ) : (
                                        <div className="rating-container">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <FaStar
                                                    key={star}
                                                    className={`star ${ratings[course.id] >= star ? 'filled' : 'empty'}`}
                                                    onClick={() => handleRatingClick(course.id, star)}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && selectedCourse && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{selectedCourse.title}</h2>
                        <p><strong>Instructor:</strong> {selectedCourse.instructor}</p>
                        <p><strong>Description:</strong> {selectedCourse.description}</p>
                        <p><strong>Restrictions:</strong> {selectedCourse.restrictions}</p>
                        <p><strong>Capacity:</strong> {selectedCourse.capacity}</p>
                        <p><strong>Announcements:</strong> {selectedCourse.announcements}</p>
                        <p><strong>Schedule:</strong> {selectedCourse.schedule}</p>

                        {/* Termination Reason Input */}
                        <div className="termination-reason">
                            <label htmlFor="terminationReason"><strong>Termination Reason:</strong></label>
                            <textarea
                                id="terminationReason"
                                className="termination-input"
                                value={terminationReason}
                                onChange={(e) => setTerminationReason(e.target.value)}
                                placeholder="Enter reason for termination"
                                required
                            ></textarea>
                        </div>

                        {/* Modal Buttons */}
                        <div className="modal-buttons">
                            <button className="withdraw-button" onClick={handleWithdraw}>
                                Withdraw Course
                            </button>
                            <button className="done-button" onClick={handleMarkAsDone}>
                                Mark as Done
                            </button>
                            <button className="close-button" onClick={handleCloseModal}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

};

export default MyCourses;
