import React, { useState } from "react";
import LayoutCoach from "./LayoutCoach"; // Import the sidebar layout
import "./ViewCoursesCoach.css";

const ViewCourses = () => {
  const dummyCourses = [
    {
      id: 1,
      date: "2024-12-20",
      time: "6:00 PM - 7:30 PM",
      title: "Beginner Swimming",
      location: "Main Pool Area",
      capacity: 10,
      students: [
        { id: 1, name: "John Doe", profilePhoto: "https://via.placeholder.com/50" },
        { id: 2, name: "Jane Smith", profilePhoto: "https://via.placeholder.com/50" },
      ],
    },
    {
      id: 2,
      date: "2024-12-25",
      time: "5:00 PM - 6:30 PM",
      title: "Intermediate Swimming",
      location: "Main Pool Area",
      capacity: 8,
      students: [
        { id: 3, name: "Alice Brown", profilePhoto: "https://via.placeholder.com/50" },
      ],
    },
    {
      id: 3,
      date: "2024-12-30",
      time: "7:00 PM - 8:30 PM",
      title: "Advanced Swimming",
      location: "Main Pool Area",
      capacity: 5,
      students: [],
    },
  ];

  const today = new Date().toISOString().split("T")[0];

  const [view, setView] = useState("upcoming"); // Toggle between 'upcoming' and 'past'
  const [selectedCourse, setSelectedCourse] = useState(null);

  const filteredCourses =
    view === "upcoming"
      ? dummyCourses.filter((course) => course.date >= today)
      : dummyCourses.filter((course) => course.date < today);

  const handleCancel = (courseId) => {
    alert(`Course with ID ${courseId} has been cancelled.`);
    // You can add actual cancellation logic here
  };

  const handleClosePopup = () => {
    setSelectedCourse(null);
  };

  return (
    <LayoutCoach>
      <div className="view-courses-container">
        <h1 className="view-courses-heading">View Courses</h1>

        {/* View Selector */}
        <div className="view-selector">
          <button
            className={`view-btn ${view === "upcoming" ? "active" : ""}`}
            onClick={() => setView("upcoming")}
          >
            Upcoming Courses
          </button>
          <button
            className={`view-btn ${view === "past" ? "active" : ""}`}
            onClick={() => setView("past")}
          >
            Past Courses
          </button>
        </div>

        {/* Course List */}
        <div className="course-list">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <div key={course.id} className="course-item">
                <div className="course-info">
                  <h3>{course.title}</h3>
                  <p>{course.date} | {course.time}</p>
                  <p>{course.location}</p>
                  <p className="capacity-info">
                    Capacity: {course.students.length}/{course.capacity}
                  </p>
                </div>
                <div className="course-actions">
                  {view === "upcoming" && ( // Show Cancel button only for upcoming courses
                    <button
                      className="cancel-btn"
                      onClick={() => handleCancel(course.id)}
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    className="details-btn"
                    onClick={() => setSelectedCourse(course)}
                  >
                    See Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="no-courses-message">No courses available.</p>
          )}
        </div>

        {/* Course Details Popup */}
        {selectedCourse && (
          <div className="popup-overlay">
            <div className="popup-content">
              <h2>Course Details</h2>
              <p><strong>Title:</strong> {selectedCourse.title}</p>
              <p><strong>Date:</strong> {selectedCourse.date}</p>
              <p><strong>Time:</strong> {selectedCourse.time}</p>
              <p><strong>Location:</strong> {selectedCourse.location}</p>
              <p><strong>Capacity:</strong> {selectedCourse.students.length}/{selectedCourse.capacity}</p>
              <h3>Students</h3>
              <ul className="students-list">
                {selectedCourse.students.length > 0 ? (
                  selectedCourse.students.map((student) => (
                    <li key={student.id} className="student-item">
                      <img src={student.profilePhoto} alt={student.name} />
                      <span>{student.name}</span>
                    </li>
                  ))
                ) : (
                  <p>No students registered for this course.</p>
                )}
              </ul>
              <button className="close-popup-btn" onClick={handleClosePopup}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </LayoutCoach>
  );
};

export default ViewCourses;
