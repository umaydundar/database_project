// CreateCourse.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar.jsx';
import './CreateCourse.css';
import { useNavigate } from 'react-router-dom';

const CreateCourse = () => {
    const navigate = useNavigate();

    // State for form fields
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [duration, setDuration] = useState('');
    const [price, setPrice] = useState('');
    const [image, setImage] = useState(null);

    // State for feedback messages
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Check user role on component mount
    useEffect(() => {
        const userRole = localStorage.getItem('userRole');
        if (userRole !== 'admin' && userRole !== 'trainer') {
            // Redirect unauthorized users
            navigate('/create-course'); // Change the path as needed
        }
    }, [navigate]);

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic form validation
        if (!title || !description || !category || !duration || !price) {
            setErrorMessage('Please fill in all required fields.');
            setSuccessMessage('');
            return;
        }

        if (isNaN(duration) || duration <= 0) {
            setErrorMessage('Duration must be a positive number.');
            setSuccessMessage('');
            return;
        }

        if (isNaN(price) || price < 0) {
            setErrorMessage('Price must be a non-negative number.');
            setSuccessMessage('');
            return;
        }

        // Handle image upload if necessary
        // For demonstration, we'll convert the image to a base64 string
        const reader = new FileReader();
        reader.onloadend = () => {
            const courseData = {
                title,
                description,
                category,
                duration: parseFloat(duration),
                price: parseFloat(price),
                image: reader.result, // base64 string
                createdBy: localStorage.getItem('username') || 'Admin', // Assuming username is stored
                createdAt: new Date().toISOString(),
            };

            // For demonstration, we'll store the course data in localStorage
            // In a real application, send this data to a backend server
            const existingCourses = JSON.parse(localStorage.getItem('courses')) || [];
            localStorage.setItem('courses', JSON.stringify([...existingCourses, courseData]));

            // Reset form fields
            setTitle('');
            setDescription('');
            setCategory('');
            setDuration('');
            setPrice('');
            setImage(null);

            // Provide success feedback
            setSuccessMessage('Course created successfully!');
            setErrorMessage('');

            // Optionally, redirect to another page
            // navigate('/courses'); // Uncomment to redirect
        };

        if (image) {
            reader.readAsDataURL(image);
        } else {
            // If no image is uploaded, proceed without it
            const courseData = {
                title,
                description,
                category,
                duration: parseFloat(duration),
                price: parseFloat(price),
                image: null,
                createdBy: localStorage.getItem('username') || 'Admin',
                createdAt: new Date().toISOString(),
            };

            const existingCourses = JSON.parse(localStorage.getItem('courses')) || [];
            localStorage.setItem('courses', JSON.stringify([...existingCourses, courseData]));

            // Reset form fields
            setTitle('');
            setDescription('');
            setCategory('');
            setDuration('');
            setPrice('');
            setImage(null);

            // Provide success feedback
            setSuccessMessage('Course created successfully!');
            setErrorMessage('');
        }
    };

    return (
        <div className="create-course-main-container">
            <div className="create-course-bottom-container">
                <Sidebar />
                <div className="create-course-content-container">
                    <h1 className="create-course-heading">Create Course or Training</h1>

                    {/* Display success message */}
                    {successMessage && (
                        <div className="create-course-success-message">
                            <p>{successMessage}</p>
                        </div>
                    )}

                    {/* Display error message */}
                    {errorMessage && (
                        <div className="create-course-error-message">
                            <p>{errorMessage}</p>
                        </div>
                    )}

                    {/* Course Creation Form */}
                    <form className="create-course-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="title">Course Title<span className="required">*</span></label>
                            <input
                                type="text"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                placeholder="Enter course title"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Description<span className="required">*</span></label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                                placeholder="Enter course description"
                            ></textarea>
                        </div>

                        <div className="form-group">
                            <label htmlFor="category">Category<span className="required">*</span></label>
                            <select
                                id="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                required
                            >
                                <option value="">Select category</option>
                                <option value="Swimming Basics">Swimming Basics</option>
                                <option value="Advanced Techniques">Advanced Techniques</option>
                                <option value="Fitness Training">Fitness Training</option>
                                <option value="Competitive Training">Competitive Training</option>
                                {/* Add more categories as needed */}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="duration">Duration (hours)<span className="required">*</span></label>
                            <input
                                type="number"
                                id="duration"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                required
                                min="1"
                                placeholder="Enter duration in hours"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="price">Price (Points)<span className="required">*</span></label>
                            <input
                                type="number"
                                id="price"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                required
                                min="0"
                                placeholder="Enter price in points"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="image">Course Image</label>
                            <input
                                type="file"
                                id="image"
                                accept="image/*"
                                onChange={(e) => setImage(e.target.files[0])}
                            />
                        </div>

                        <button type="submit" className="create-course-submit-button">Create Course</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateCourse;
