import React, { useState, useEffect } from "react";
import LayoutCoach from "./LayoutCoach";
import "./ViewCoursesCoach.css";
import axios from "axios";

const ViewCourses = () => {
  const [currentCourses, setCurrentCourses] = useState([]);
  const [previousCourses, setPreviousCourses] = useState([]);
  const [view, setView] = useState("upcoming"); 
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseStudents, setCourseStudents] = useState([]);
  const [error, setError] = useState("");
  const coachId = localStorage.getItem("userId");

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchCurrentCourses = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/coach_courses_current/",
          {
              params: {coachId},
              headers: {
                  "Content-Type": "application/json",
              },
              withCredentials: true,
          }
        );

        console.log(response);
        setCurrentCourses(response.data.coach_courses);
      } catch (err) {
        setError("Failed to fetch current courses.");
        console.error(err);
      } 
    };

    const fetchPreviousCourses = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/coach_courses_previous/",
          {
              params: {coachId},
              headers: {
                  "Content-Type": "application/json",
              },
              withCredentials: true,
          }
        );

        console.log(response);
        console.log(response.data.coach_courses);
        setPreviousCourses(response.data.coach_courses);
      } catch (err) {
        setError("Failed to fetch previous courses.");
        console.error(err);
      } 
    };

    fetchCurrentCourses();
    fetchPreviousCourses();
  }, []);

  const handleCancel = async (courseId) => {
    try {
      const coachId = localStorage.getItem("coachId");
      const response = await axios.post(
        `http://127.0.0.1:8000/api/cancel_course/`,
        { "course_id": courseId, "coach_id": coachId },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.status === 200) {
        alert("Course successfully cancelled.");
        setCurrentCourses((prevCourses) =>
          prevCourses.filter((course) => course.course_id !== courseId)
        );
      } else {
        setError(response.data.error || "Failed to cancel course.");
      }
    } catch (err) {
      setError("An unexpected error occurred while cancelling the course.");
      console.error(err);
    }
  };

  const handleFinish = async (courseId) => {
    try {

      const response = await axios.post(
        `http://127.0.0.1:8000/api/finish_course/`,
        { "course_id": courseId, "coach_id": coachId },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        alert("Course successfully finished.");
        setCurrentCourses((prevCourses) =>
          prevCourses.filter((course) => course.course_id !== courseId)
        );
      } else {
        setError(response.data.error || "Failed to finish course.");
      }
    } catch (err) {
      setError("An unexpected error occurred while finishing the course.");
      console.error(err);
    }
  };

  const handleSelectedStudents = async (course) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/course_students/?course_id=${course.course_id}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        console.log(response);
        console.log(response.data.students);
        setCourseStudents(response.data.students);
      } else {
        setError(response.data.error || "Failed to finish course.");
      }
    } catch (err) {
      setError("An unexpected error occurred while finishing the course.");
      console.error(err);
    }
  };

  const filteredCourses =
    view === "upcoming"
      ? currentCourses 
      : previousCourses || [];

  const handleClosePopup = () => {
    setSelectedCourse(null);
  };

  return (
    <LayoutCoach>
      <div className="view-courses-container ">
        <h1 className="view-courses-heading">View Courses</h1>

        {/* Error Handling */}
        {error && <p className="error-message">{error}</p>}
        <>
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
                <div key={course.course_id} className="course-item">
                  <div className="course-info">
                    <h3>{course.course_name}</h3>
                    <p>
                       {course.date} | {course.start_time} - {course.end_time} | {course.course_description}
                    </p>
                    <p>{"Course Location: Pool " + course.pool_id}</p>
                    <p>{"Lane " + course.lane_id}</p>
                  </div>
                  <div className="course-actions">
                    {view === "upcoming" && (
                      <button
                        className="cancel-btn"
                        onClick={() => handleCancel(course.course_id)}
                      >
                        Cancel
                      </button>
                    )}
                    {view === "upcoming" && (
                      <button
                        className="finish-btn"
                        onClick={() => handleFinish(course.course_id)}
                      >
                        Finish
                      </button>
                    )}
                    <button
                      className="details-btn"
                      onClick={() => {setSelectedCourse(course)
                        handleSelectedStudents(course)
                      }}
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
        </>

        {/* Course Details Popup */}
        {selectedCourse && (
          <div className="popup-overlay">
            <div className="popup-content">
              <h2>Course Details</h2>
              <p>
                <strong>Title:</strong> {selectedCourse.course_name}
              </p>
              <p>
                <strong>Date:</strong> {selectedCourse.date}
              </p>
              <p>
                <strong>Time:</strong> {selectedCourse.start_time} - {selectedCourse.end_time}
              </p>
              <p>
                <strong>Location:</strong> {"Pool " + selectedCourse.pool_id}
              </p>
              <p>
                <strong>Capacity:</strong> {selectedCourse.capacity}
              </p>
              <h3>Students</h3>
              <ul className="students-list">
              {courseStudents.length > 0 ? (
                courseStudents.map((student) => (
                  <li key={student.id} className="student-item">
                    <img 
                      src={student.profilePhoto || "https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg"} 
                      alt={student.name} 
                    />
                    <span>{student.name}</span>
                    <span>{student.surname}</span>
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