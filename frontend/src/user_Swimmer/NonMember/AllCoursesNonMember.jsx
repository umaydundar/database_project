import React, { useState } from 'react';
import Sidebar from './LayoutNonMember.jsx';
import './AllCoursesNonMember.css';
import { FaEye } from 'react-icons/fa';

const AllCourses = () => {
    const allCourses = [
        {
            id: 1,
            title: 'Beginner Swimming',
            instructor: 'John Doe',
            capacity: 20,
            enrolled: 20,
            rating: 4.5,
            enrollmentDeadline: '2024-12-21',
            description: 'Learn the basics of swimming, including freestyle, backstroke, and water safety.',
            duration: '8 weeks',
            poolLocation: 'Main Pool Area',
            schedule: 'Mondays and Wednesdays, 6:00 PM - 7:30 PM',
            restrictions: 'Must be able to swim at least 25 meters.',
            announcements: 'New swimming goggles available for purchase.',
        },
        {
            id: 2,
            title: 'Intermediate Swimming',
            instructor: 'Jane Smith',
            capacity: 15,
            enrolled: 12,
            rating: 4.7,
            enrollmentDeadline: '2024-12-22',
            description: 'Improve your swimming techniques and endurance with advanced drills and workouts.',
            duration: '6 weeks',
            poolLocation: 'Main Pool Area',
            schedule: 'Tuesdays and Thursdays, 5:00 PM - 6:30 PM',
            restrictions: 'Must complete Beginner Swimming course or equivalent.',
            announcements: 'Coach Jane will be joining us for the first session.',
        },
        {
            id: 3,
            title: 'Advanced Swimming Techniques',
            instructor: 'Alice Johnson',
            capacity: 10,
            enrolled: 8,
            rating: 4.8,
            enrollmentDeadline: '2024-12-23',
            description: 'Master advanced swimming techniques and competitive strategies.',
            duration: '10 weeks',
            poolLocation: 'Olympic Pool',
            schedule: 'Fridays, 4:00 PM - 6:00 PM',
            restrictions: 'Must have completed Intermediate Swimming course.',
            announcements: 'Final course of the season.',
        },
        {
            id: 4,
            title: 'Water Aerobics',
            instructor: 'Bob Brown',
            capacity: 25,
            enrolled: 20,
            rating: 4.3,
            enrollmentDeadline: '2024-12-20',
            description: 'Engage in low-impact, high-efficiency workouts in the water to improve fitness and flexibility.',
            duration: '12 weeks',
            poolLocation: 'Fitness Pool',
            schedule: 'Saturdays, 9:00 AM - 10:30 AM',
            restrictions: 'Open to all fitness levels.',
            announcements: 'Bring your own water bottle.',
        },
    ];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);

    // Sorting courses
    const sortedCourses = [...allCourses].sort((a, b) => {
        // Sort by availability (fully enrolled courses last)
        if (a.enrolled === a.capacity && b.enrolled !== b.capacity) return 1;
        if (b.enrolled === b.capacity && a.enrolled !== a.capacity) return -1;

        // Then by rating (higher rating first)
        if (b.rating !== a.rating) return b.rating - a.rating;

        // Then by enrollment deadline (earlier deadline first)
        return new Date(a.enrollmentDeadline) - new Date(b.enrollmentDeadline);
    });

    const handleDetailsClick = (course) => {
        setSelectedCourse(course);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCourse(null);
    };

    return (
        <div className="allcourses-main-container">
            <div className="allcourses-bottom-container">
                <Sidebar />
                <div className="allcourses-content-container">
                    <h1 className="allcourses-heading">All Courses</h1>

                    {/* Courses List */}
                    <div className="allcourses-courses-list">
                        {sortedCourses.map((course) => (
                            <div key={course.id} className="allcourses-course-card">
                                <div className="allcourses-course-header">
                                    <h2>{course.title}</h2>
                                </div>
                                <div className="allcourses-course-brief">
                                    <p><strong>Instructor:</strong> {course.instructor} (Rating: {course.rating})</p>
                                    <p><strong>Capacity:</strong> {course.capacity - course.enrolled}/{course.capacity}</p>
                                    <p><strong>Deadline:</strong> {course.enrollmentDeadline}</p>
                                </div>
                                <div className="allcourses-course-actions">
                                    <button className="allcourses-details-button" onClick={() => handleDetailsClick(course)}>
                                        <FaEye /> Details
                                    </button>
                                    {course.enrolled === course.capacity ? (
                                        <button className="allcourses-enroll-button full" disabled>
                                            Full
                                        </button>
                                    ) : (
                                        <button className="allcourses-enroll-button">
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
                        <h2>{selectedCourse.title}</h2>
                        <p><strong>Instructor:</strong> {selectedCourse.instructor} (Rating: {selectedCourse.rating})</p>
                        <p><strong>Description:</strong> {selectedCourse.description}</p>
                        <p><strong>Duration:</strong> {selectedCourse.duration}</p>
                        <p><strong>Pool Location:</strong> {selectedCourse.poolLocation}</p>
                        <p><strong>Schedule:</strong> {selectedCourse.schedule}</p>
                        <p><strong>Restrictions:</strong> {selectedCourse.restrictions}</p>
                        <p><strong>Capacity:</strong> {selectedCourse.capacity - selectedCourse.enrolled}/{selectedCourse.capacity}</p>
                        <p><strong>Announcements:</strong> {selectedCourse.announcements}</p>

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

export default AllCourses;
