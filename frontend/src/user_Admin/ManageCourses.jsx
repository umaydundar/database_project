import React, { useState, useEffect } from "react";
import LayoutAdmin from "./LayoutAdmin";
import "./ManageCourses.css";

const ManageCourses = () => {
    const [courses, setCourses] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);

    useEffect(() => {
        // Backend'den kursları çekme
        const fetchCourses = async () => {
            try {
                const response = await fetch("http://127.0.0.1:8000/api/get_all_courses/");
                if (response.ok) {
                    const data = await response.json();
                    setCourses(data.courses); 
                } else {
                    console.error("Error fetching courses:", response.statusText);
                }
            } catch (error) {
                console.error("Error fetching courses:", error);
            }
        };

        fetchCourses();
    }, []);

    const handleDelete = async (courseId) => {
        if (window.confirm("Are you sure you want to delete this course?")) {
            try {
                const response = await fetch("http://127.0.0.1:8000/api/delete_course/", {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ course_id: courseId }),
                });

                if (response.ok) {
                    // Başarılı silme işleminden sonra listeyi güncelle
                    setCourses(courses.filter((course) => course.course_id !== courseId));
                } else {
                    console.error("Error deleting course:", response.statusText);
                }
            } catch (error) {
                console.error("Error deleting course:", error);
            }
        }
    };


    // Modal'ı kapatma fonksiyonu
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedCourse(null);
    };

    return (
        <LayoutAdmin>
            <div className="manage-courses-content-container">
                <h1 className="manage-courses-heading">Manage Courses</h1>

                <section className="manage-courses-section">
                    <h2>All Courses</h2>
                    <div className="manage-courses-table-container">
                        <table className="manage-courses-table">
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Course Name</th>
                                <th>Course Pool</th>
                                <th>Course Lane</th>
                                <th>Coach</th>
                                <th>Capacity</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {courses.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="no-courses">
                                        No courses found.
                                    </td>
                                </tr>
                            ) : (
                                courses.map((course) => (
                                    <tr key={course.course_id}>
                                        <td>{course.course_id}</td>
                                        <td>{course.course_name}</td>
                                        <td>{course.pool_id || "N/A"}</td>
                                        <td>{course.lane_id || "N/A"}</td>
                                        <td>{course.coach_id || "N/A"}</td>
                                        <td>{course.capacity || "N/A"}</td>
                                        <td>
                                            <button
                                                onClick={() => handleDelete(course.course_id)}
                                                className="manage-courses-delete-button"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Modal */}
                {showModal && selectedCourse && (
                    <div className="courses-modal-overlay">
                        <div className="courses-modal-content">
                            <h2>Course Details</h2>
                            <p><strong>ID:</strong> {selectedCourse.course_id}</p>
                            <p><strong>Name:</strong> {selectedCourse.course_name}</p>
                            <p><strong>Code:</strong> {selectedCourse.course_code || "N/A"}</p>
                            <p><strong>Instructor:</strong> {selectedCourse.instructor || "N/A"}</p>
                            <p><strong>Credits:</strong> {selectedCourse.credits || "N/A"}</p>

                            {/* Diğer backend alanları (deadline, price, vs.) burada gösterebilirsiniz */}
                            {/* <p><strong>Price:</strong> {selectedCourse.price}</p> */}

                            <button onClick={handleCloseModal} className="close-modal-button">
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </LayoutAdmin>
    );
};

export default ManageCourses;