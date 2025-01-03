import React, { useState } from "react";
import LayoutCoach from "./LayoutCoach"; 
import "./CreateCourse.css";

const CreateCourse = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const userId = localStorage.getItem("userId");
    const poolFacilities = {
        "1": {
            lanes: {
                1: [{ start: "08:00", end: "20:00" }],
                2: [{ start: "08:00", end: "20:00" }],
                3: [{ start: "08:00", end: "20:00" }],
                4: [{ start: "08:00", end: "20:00" }],
                5: [{ start: "08:00", end: "20:00" }],
            },
        },
        "2": {
            lanes: {
                1: [{ start: "08:00", end: "20:00" }],
                2: [{ start: "08:00", end: "20:00" }],
                3: [{ start: "08:00", end: "20:00" }],
                4: [{ start: "08:00", end: "20:00" }],
                5: [{ start: "08:00", end: "20:00" }],
            },
        },
    };

    const coachCalendar = [
        { date: "2024-12-30", start: "10:00", end: "12:00" },
        { date: "2024-12-31", start: "14:00", end: "16:00" },
    ];

    const [selectedFacility, setSelectedFacility] = useState("");
    const [selectedLanes, setSelectedLanes] = useState([]);
    const [formData, setFormData] = useState({
        date: "",
        startTime: "",
        endTime: "",
        ageRange: "",
        weightRange: "",
        sex: "",
        price: "",
        capacity: "",
        explanation: "",
        courseName: "",
    });
    const [error, setError] = useState("");

    const isTimeValid = (time) => {
        const [hours, minutes] = time.split(":").map(Number);
        return hours >= 8 && hours <= 22;
    };

    const isCoachAvailable = (date, start, end) => {
        return coachCalendar.every(
            (slot) => slot.date !== date || end <= slot.start || start >= slot.end
        );
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setError("");
    };

    const handleFacilityChange = (e) => {
        setSelectedFacility(e.target.value);
        setSelectedLanes([]);
    };

    const handleLaneSelection = (lane) => {
        if (selectedLanes.includes(lane)) {
            setSelectedLanes(selectedLanes.filter((l) => l !== lane));
            setError("");
        } else if (selectedLanes.length < 3) {
            setSelectedLanes([...selectedLanes, lane]);
            setError("");
        } else {
            setError("You can only select up to 3 lanes.");
        }
    };

    const validateRanges = (range, min, max) => {
        const trimmedRange = range.trim();
        const [low, high] = trimmedRange.split("-").map(Number);
        return (
            trimmedRange.includes("-") &&
            low >= min &&
            high <= max &&
            low < high
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { date, startTime, endTime, ageRange, weightRange, sex, price, capacity, explanation, courseName } = formData;
    
        const restrictions = `${sex},${ageRange},${weightRange}`;

        try {
            const response = await fetch("http://127.0.0.1:8000/api/create_course/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId,
                    date,
                    startTime,
                    endTime,
                    restrictions,
                    price,
                    capacity,
                    explanation,
                    facility: selectedFacility,
                    lanes: selectedLanes,
                    courseName: formData.courseName,
                }),
            });
    
            if (response.ok) {
                const data = await response.json();
                alert("Course created successfully!");

    
                setFormData({
                    date: "",
                    startTime: "",
                    endTime: "",
                    ageRange: "",
                    weightRange: "",
                    sex: "",
                    price: "",
                    capacity: "",
                    explanation: "",
                    courseName: "",
                });
                setSelectedFacility("");
                setSelectedLanes([]);
                setError("");
            } else {
                const errorData = await response.json();
                setError(errorData.error || "An error occurred while creating the course.");
            }
        } catch (error) {
            setError("An error occurred while connecting to the server. Please try again.");
            console.error(error);
        }
    };
    
    

    const handleCheckAvailability = () => {
        const { date, startTime, endTime } = formData;

        if (!date || !startTime || !endTime) {
            setError("Please select a date, start time, and end time.");
            return;
        }

        const today = new Date();
        const selectedDate = new Date(date);

        if (selectedDate < new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)) {
            setError("Date must be at least 3 days from today.");
            return;
        }

        if (!isTimeValid(startTime) || !isTimeValid(endTime)) {
            setError("Pool is open only from 8:00 AM to 10:00 PM.");
            return;
        }

        if (startTime >= endTime) {
            setError("Start time must be before end time.");
            return;
        }

        if (!isCoachAvailable(date, startTime, endTime)) {
            setError("You have a conflicting appointment on your calendar.");
            return;
        }

        setError("");
        alert("The selected time and date are available.");
    };

    const availableLanes = selectedFacility
        ? Object.keys(poolFacilities[selectedFacility].lanes).map((lane) => lane)
        : [];

    return (
        <LayoutCoach>
            <div className="create-course-content-container">
                <h1 className="create-course-heading">Create Course</h1>
                <form className="create-course-form" onSubmit={handleSubmit}>
                    {error && <p className="error-message">{error}</p>}

                    {/* Date Selection */}
                    <div className="form-group">
                        <label htmlFor="date">Start Date:</label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            value={formData.date}
                            onChange={handleInputChange}
                            min={new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                            required
                        />
                    </div>

                    {/* Time Selection */}
                    <div className="form-group">
                        <label htmlFor="startTime">Start Time:</label>
                        <input
                            type="time"
                            id="startTime"
                            name="startTime"
                            value={formData.startTime}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="endTime">End Time:</label>
                        <input
                            type="time"
                            id="endTime"
                            name="endTime"
                            value={formData.endTime}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    {/* Check Availability Button */}
                    <button
                        type="button"
                        className="check-availability-button"
                        onClick={handleCheckAvailability}
                    >
                        Check Availability
                    </button>

                    {/* Facility Selection */}
                    <div className="form-group">
                        <label htmlFor="facility">Pool Facility:</label>
                        <select
                            id="facility"
                            value={selectedFacility}
                            onChange={handleFacilityChange}
                            disabled={!formData.startTime || !formData.endTime}
                            required
                        >
                            <option value="">--Select Facility--</option>
                            {Object.keys(poolFacilities).map((facility) => (
                                <option key={facility} value={facility}>
                                    {facility}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Lane Selection */}
                    {selectedFacility && (
                        <div className="create-course-lane-selection">
                            <label>Available Lanes:</label>
                            <div className="create-course-lane-options">
                                {availableLanes.map((lane) => (
                                    <button
                                        key={lane}
                                        type="button"
                                        className={`lane-button ${
                                            selectedLanes.includes(lane) ? "selected" : ""
                                        }`}
                                        onClick={() => handleLaneSelection(lane)}
                                    >
                                        Lane {lane}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Other Inputs */}
                    <div className="form-group">
                        <label htmlFor="courseName">Course Name:</label>
                        <input
                            type="text"
                            id="courseName"
                            name="courseName"
                            value={formData.courseName}
                            onChange={handleInputChange}
                            placeholder="Enter course name"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="ageRange">Age Range:</label>
                        <input
                            type="text"
                            id="ageRange"
                            name="ageRange"
                            value={formData.ageRange}
                            onChange={handleInputChange}
                            placeholder="e.g., 10-18"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="weightRange">Weight Range:</label>
                        <input
                            type="text"
                            id="weightRange"
                            name="weightRange"
                            value={formData.weightRange}
                            onChange={handleInputChange}
                            placeholder="e.g., 30-70"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="sex">Sex:</label>
                        <select
                            id="sex"
                            name="sex"
                            value={formData.sex}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">--Select--</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Any">Any</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="price">Price (TL):</label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="capacity">Capacity:</label>
                        <input
                            type="number"
                            id="capacity"
                            name="capacity"
                            value={formData.capacity}
                            onChange={handleInputChange}
                            min="1"
                            max="10"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="explanation">Explanation:</label>
                        <textarea
                            id="explanation"
                            name="explanation"
                            value={formData.explanation}
                            onChange={handleInputChange}
                            placeholder="Add additional details about the course"
                            required
                        ></textarea>
                    </div>

                    <button type="submit" className="create-course-submit-button">
                        Create Course
                        
                    </button>
                </form>
            </div>
        </LayoutCoach>
    );
};

export default CreateCourse;
