import React, { useState, useEffect } from "react";
import Sidebar from "./LayoutNonMember.jsx";
import "./MyCoursesNonMember.css";
import { FaEye, FaStar } from "react-icons/fa";
import axios from "axios";

const MyCourses = () => {
    const [selectedCategory, setSelectedCategory] = useState("current"); // 'current' or 'previous'
    const [courses, setCourses] = useState({ upcoming: [], previous: [] }); // Store fetched courses
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [terminationReason, setTerminationReason] = useState("");
    const [ratings, setRatings] = useState({}); // Stores ratings for previous courses
    const [error, setError] = useState("");

    // Fetch courses on component mount
    useEffect(() => {
        const fetchCourses = async () => {
            const nonMemberId = localStorage.getItem("nonMemberId");
            if (!nonMemberId) {
                setError("User not logged in.");
                return;
            }

            try {
                const response = await axios.get(
                    `http://127.0.0.1:8000/api/nonmember_courses/?nonmember_id=${nonMemberId}`
                );

                if (response.status === 200) {
                    setCourses({
                        upcoming: response.data.upcoming_courses,
                        previous: response.data.previous_courses,
                    });
                } else {
                    setError("Failed to fetch courses.");
                }
            } catch (err) {
                console.error("Error fetching courses:", err);
                setError("Failed to fetch courses. Please try again later.");
            }
        };

        fetchCourses();
    }, []);

    const coursesToDisplay =
        selectedCategory === "current" ? courses.upcoming : courses.previous;

    const handleViewClick = (course) => {
        setSelectedCourse(course);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCourse(null);
        setTerminationReason("");
    };

    const handleWithdraw = () => {
        if (terminationReason.trim() === "") {
            alert("Please provide a termination reason.");
            return;
        }
        alert(`Course "${selectedCourse.course_name}" has been withdrawn.\nReason: ${terminationReason}`);
        handleCloseModal();
    };

    const handleRatingClick = (courseId, rating) => {
        setRatings((prevRatings) => ({
            ...prevRatings,
            [courseId]: rating,
        }));
        alert(`You rated "${getCourseTitle(courseId)}" with ${rating} star(s).`);
    };

    const getCourseTitle = (courseId) => {
        const allCourses = [...courses.upcoming, ...courses.previous];
        const course = allCourses.find((c) => c.course_id === courseId);
        return course ? course.course_name : "";
    };

    return (
        <div className="main-container">
            <div className="bottom-container">
                <Sidebar />
                <div className="content-container">
                    <h1>My Courses</h1>
                    <div className="category-selector">
                        <button
                            className={`category-btn ${selectedCategory === "current" ? "active" : ""}`}
                            onClick={() => setSelectedCategory("current")}
                        >
                            Upcoming Courses
                        </button>
                        <button
                            className={`category-btn ${selectedCategory === "previous" ? "active" : ""}`}
                            onClick={() => setSelectedCategory("previous")}
                        >
                            Previous Courses
                        </button>
                    </div>

                    <div className="courses-list">
                        {coursesToDisplay.map((course) => (
                            <div key={course.course_id} className="course-card">
                                <div className="course-header">
                                    <h2>{course.course_name}</h2>
                                </div>
                                <div className="course-details">
                                    <p><strong>Description:</strong> {course.course_description}</p>
                                    <p><strong>Pool:</strong> {course.pool_id}</p>
                                    <p><strong>Lane:</strong> {course.lane_id}</p>
                                    <p><strong>Price:</strong> ${course.price}</p>
                                </div>
                                <div className="course-actions">
                                    {selectedCategory === "current" ? (
                                        <button
                                            className="view-button"
                                            onClick={() => handleViewClick(course)}
                                        >
                                            <FaEye /> View
                                        </button>
                                    ) : (
                                        <div className="rating-container">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <FaStar
                                                    key={star}
                                                    className={`star ${
                                                        ratings[course.course_id] >= star ? "filled" : "empty"
                                                    }`}
                                                    onClick={() => handleRatingClick(course.course_id, star)}
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

            {isModalOpen && selectedCourse && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{selectedCourse.course_name}</h2>
                        <p><strong>Description:</strong> {selectedCourse.course_description}</p>
                        <p><strong>Pool:</strong> {selectedCourse.pool_id}</p>
                        <p><strong>Lane:</strong> {selectedCourse.lane_id}</p>
                        <p><strong>Price:</strong> ${selectedCourse.price}</p>
                        <div className="termination-reason">
                            <label htmlFor="terminationReason"><strong>Termination Reason:</strong></label>
                            <textarea
                                id="terminationReason"
                                value={terminationReason}
                                onChange={(e) => setTerminationReason(e.target.value)}
                                placeholder="Enter reason for termination"
                                required
                            />
                        </div>
                        <div className="modal-buttons">
                            <button className="withdraw-button" onClick={handleWithdraw}>
                                Withdraw
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
