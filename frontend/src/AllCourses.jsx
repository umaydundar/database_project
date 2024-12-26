// AllCourses.jsx
import React, { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import './AllCourses.css';
import { FaEye } from 'react-icons/fa';

const AllCourses = () => {
    // Mock data - All Available Courses
    const allCourses = [
        {
            id: 1,
            title: 'Beginner Swimming',
            instructor: 'John Doe',
            capacity: 20,
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
            description: 'Engage in low-impact, high-efficiency workouts in the water to improve fitness and flexibility.',
            duration: '12 weeks',
            poolLocation: 'Fitness Pool',
            schedule: 'Saturdays, 9:00 AM - 10:30 AM',
            restrictions: 'Open to all fitness levels.',
            announcements: 'Bring your own water bottle.',
        },
        // Add more courses as needed
    ];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterLocation, setFilterLocation] = useState('All');

    // Get unique pool locations for the filter dropdown
    const poolLocations = ['All', ...new Set(allCourses.map(course => course.poolLocation))];

    // Handle opening the modal with the selected course
    const handleDetailsClick = (course) => {
        setSelectedCourse(course);
        setIsModalOpen(true);
    };

    // Handle closing the modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCourse(null);
    };

    // Handle Enroll action
    const handleEnroll = (course) => {
        // Implement your enroll logic here (e.g., API call)
        alert(`You have enrolled in "${course.title}".`);
    };

    // Filter courses based on search term and selected pool location
    const filteredCourses = allCourses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLocation = filterLocation === 'All' || course.poolLocation === filterLocation;
        return matchesSearch && matchesLocation;
    });

    return (
        <div className="allcourses-main-container">
            <div className="allcourses-bottom-container">
                <Sidebar />
                <div className="allcourses-content-container">
                    <h1 className="allcourses-heading">All Courses</h1>

                    {/* Search and Filter Section */}
                    <div className="allcourses-search-filter">
                        {/* Search Input */}
                        <input
                            type="text"
                            className="allcourses-search-input"
                            placeholder="Search by title or instructor..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />

                        {/* Filter Dropdown */}
                        <select
                            className="allcourses-filter-select"
                            value={filterLocation}
                            onChange={(e) => setFilterLocation(e.target.value)}
                        >
                            {poolLocations.map((location, index) => (
                                <option key={index} value={location}>
                                    {location}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Courses List */}
                    <div className="allcourses-courses-list">
                        {filteredCourses.length > 0 ? (
                            filteredCourses.map((course) => (
                                <div key={course.id} className="allcourses-course-card">
                                    <div className="allcourses-course-header">
                                        <h2>{course.title}</h2>
                                    </div>
                                    <div className="allcourses-course-brief">
                                        <p><strong>Instructor:</strong> {course.instructor}</p>
                                        <p><strong>Capacity:</strong> {course.capacity}</p>
                                    </div>
                                    <div className="allcourses-course-actions">
                                        <button className="allcourses-details-button" onClick={() => handleDetailsClick(course)}>
                                            <FaEye /> Details
                                        </button>
                                        <button className="allcourses-enroll-button" onClick={() => handleEnroll(course)}>
                                            Enroll
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="allcourses-no-results">No courses found.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && selectedCourse && (
                <div className="allcourses-modal-overlay" onClick={handleCloseModal}>
                    <div className="allcourses-modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{selectedCourse.title}</h2>
                        <p><strong>Instructor:</strong> {selectedCourse.instructor}</p>
                        <p><strong>Description:</strong> {selectedCourse.description}</p>
                        <p><strong>Duration:</strong> {selectedCourse.duration}</p>
                        <p><strong>Pool Location:</strong> {selectedCourse.poolLocation}</p>
                        <p><strong>Schedule:</strong> {selectedCourse.schedule}</p>
                        <p><strong>Restrictions:</strong> {selectedCourse.restrictions}</p>
                        <p><strong>Capacity:</strong> {selectedCourse.capacity}</p>
                        <p><strong>Announcements:</strong> {selectedCourse.announcements}</p>

                        {/* Modal Buttons */}
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
