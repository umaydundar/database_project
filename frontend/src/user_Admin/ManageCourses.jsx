import React, { useState, useEffect } from "react";
import LayoutAdmin from "./LayoutAdmin"; // Import LayoutAdmin
import "./ManageCourses.css";

const ManageCourses = () => {
    const mockCourses = [
        {
            id: 101,
            name: "Introduction to Computer Science",
            code: "CS101",
            instructor: "Dr. John Doe",
            credits: 3,
        },
        {
            id: 102,
            name: "Calculus I",
            code: "MATH101",
            instructor: "Dr. Jane Smith",
            credits: 4,
        },
        {
            id: 103,
            name: "Physics I",
            code: "PHY101",
            instructor: "Dr. Alice Johnson",
            credits: 4,
        },
        {
            id: 104,
            name: "English Composition",
            code: "ENG101",
            instructor: "Prof. Bob Brown",
            credits: 3,
        },
        {
            id: 105,
            name: "Data Structures",
            code: "CS102",
            instructor: "Dr. Sara Lee",
            credits: 3,
        },
    ];

    const [courses, setCourses] = useState([]);

    useEffect(() => {
        const storedCourses = JSON.parse(localStorage.getItem("courses"));
        if (storedCourses && storedCourses.length > 0) {
            setCourses(storedCourses);
        } else {
            setCourses(mockCourses);
            localStorage.setItem("courses", JSON.stringify(mockCourses));
        }
    }, []);

    const handleDelete = (courseId) => {
        if (window.confirm("Are you sure you want to delete this course?")) {
            const updatedCourses = courses.filter((course) => course.id !== courseId);
            setCourses(updatedCourses);
            localStorage.setItem("courses", JSON.stringify(updatedCourses));
        }
    };

    const handleViewCourse = (courseId) => {
        alert(`View course details for Course ID: ${courseId}`);
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
                                    <th>Course Code</th>
                                    <th>Instructor</th>
                                    <th>Credits</th>
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
                                        <tr key={course.id}>
                                            <td>{course.id}</td>
                                            <td>{course.name}</td>
                                            <td>{course.code}</td>
                                            <td>{course.instructor}</td>
                                            <td>{course.credits}</td>
                                            <td>
                                                <button
                                                    onClick={() => handleViewCourse(course.id)}
                                                    className="manage-courses-view-button"
                                                >
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(course.id)}
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
            </div>
        </LayoutAdmin>
    );
};

export default ManageCourses;
