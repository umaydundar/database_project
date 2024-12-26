// Ratings.jsx
import React, { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import './Ratings.css';

const Ratings = () => {
    // Mock data for Best Rated Courses
    const initialCourses = [
        {
            id: 1,
            title: 'Beginner Swimming',
            instructor: 'John Doe',
            averageRating: 4.5,
            reviews: [],
        },
        {
            id: 2,
            title: 'Advanced Diving',
            instructor: 'Jane Smith',
            averageRating: 4.8,
            reviews: [],
        },
        // Add more courses as needed
    ];

    // Mock data for Best Rated Coaches
    const initialCoaches = [
        {
            id: 1,
            name: 'Alice Johnson',
            expertise: 'Freestyle Techniques',
            averageRating: 4.9,
            reviews: [],
        },
        {
            id: 2,
            name: 'Bob Brown',
            expertise: 'Backstroke Mastery',
            averageRating: 4.7,
            reviews: [],
        },
        // Add more coaches as needed
    ];

    const [courses, setCourses] = useState(initialCourses);
    const [coaches, setCoaches] = useState(initialCoaches);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null); // Can be a course or coach
    const [ratingValue, setRatingValue] = useState(5);
    const [reviewText, setReviewText] = useState('');

    // Handle opening the modal
    const handleAddRating = (item, type) => {
        setCurrentItem({ ...item, type });
        setIsModalOpen(true);
        setRatingValue(5);
        setReviewText('');
    };

    // Handle closing the modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    // Handle submitting the rating
    const handleSubmitRating = (e) => {
        e.preventDefault();
        if (!currentItem) return;

        const newReview = {
            rating: ratingValue,
            text: reviewText,
        };

        if (currentItem.type === 'course') {
            const updatedCourses = courses.map(course => {
                if (course.id === currentItem.id) {
                    const updatedReviews = [...course.reviews, newReview];
                    const newAverage = (
                        updatedReviews.reduce((acc, curr) => acc + curr.rating, 0) /
                        updatedReviews.length
                    ).toFixed(1);
                    return { ...course, reviews: updatedReviews, averageRating: newAverage };
                }
                return course;
            });
            setCourses(updatedCourses);
        } else if (currentItem.type === 'coach') {
            const updatedCoaches = coaches.map(coach => {
                if (coach.id === currentItem.id) {
                    const updatedReviews = [...coach.reviews, newReview];
                    const newAverage = (
                        updatedReviews.reduce((acc, curr) => acc + curr.rating, 0) /
                        updatedReviews.length
                    ).toFixed(1);
                    return { ...coach, reviews: updatedReviews, averageRating: newAverage };
                }
                return coach;
            });
            setCoaches(updatedCoaches);
        }

        handleCloseModal();
    };

    return (
        <div className="ratings-main-container">
            <div className="ratings-bottom-container">
                <Sidebar />
                <div className="ratings-content-container">
                    <h1 className="ratings-heading">Ratings</h1>

                    {/* Best Rated Courses */}
                    <section className="ratings-section">
                        <h2>Best Rated Courses</h2>
                        <div className="ratings-list">
                            {courses.sort((a, b) => b.averageRating - a.averageRating).map(course => (
                                <div key={course.id} className="ratings-list-item">
                                    <div className="ratings-item-details">
                                        <h3>{course.title}</h3>
                                        <p><strong>Instructor:</strong> {course.instructor}</p>
                                        <p><strong>Average Rating:</strong> {course.averageRating} / 5</p>
                                    </div>
                                    <button
                                        className="ratings-add-rating-button"
                                        onClick={() => handleAddRating(course, 'course')}
                                    >
                                        Add Rating
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Best Rated Coaches */}
                    <section className="ratings-section">
                        <h2>Best Rated Coaches</h2>
                        <div className="ratings-list">
                            {coaches.sort((a, b) => b.averageRating - a.averageRating).map(coach => (
                                <div key={coach.id} className="ratings-list-item">
                                    <div className="ratings-item-details">
                                        <h3>{coach.name}</h3>
                                        <p><strong>Expertise:</strong> {coach.expertise}</p>
                                        <p><strong>Average Rating:</strong> {coach.averageRating} / 5</p>
                                    </div>
                                    <button
                                        className="ratings-add-rating-button"
                                        onClick={() => handleAddRating(coach, 'coach')}
                                    >
                                        Add Rating
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            {/* Modal for Adding Rating */}
            {isModalOpen && currentItem && (
                <div className="ratings-modal-overlay" onClick={handleCloseModal}>
                    <div className="ratings-modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Add Rating for {currentItem.type === 'course' ? currentItem.title : currentItem.name}</h2>
                        <form onSubmit={handleSubmitRating} className="ratings-form">
                            <label htmlFor="rating">Rating:</label>
                            <select
                                id="rating"
                                value={ratingValue}
                                onChange={(e) => setRatingValue(parseInt(e.target.value))}
                                required
                            >
                                <option value={5}>5 - Excellent</option>
                                <option value={4}>4 - Very Good</option>
                                <option value={3}>3 - Good</option>
                                <option value={2}>2 - Fair</option>
                                <option value={1}>1 - Poor</option>
                            </select>

                            <label htmlFor="review">Review:</label>
                            <textarea
                                id="review"
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                placeholder="Write your review here..."
                                required
                            ></textarea>

                            <div className="ratings-form-buttons">
                                <button type="submit" className="ratings-submit-button">Submit</button>
                                <button type="button" className="ratings-cancel-button" onClick={handleCloseModal}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );

};

export default Ratings;
