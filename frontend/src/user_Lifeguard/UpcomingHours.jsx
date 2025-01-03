import React, { useEffect, useState } from "react";
import axios from "axios";
import LayoutLifeguard from "./LayoutLifeguard";
import "./UpcomingHours.css";

const UpcomingHours = () => {
  const lifeguardId = localStorage.getItem("lifeguardId");
  const [upcomingLanes, setUpcomingLanes] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch upcoming lanes from the backend
   */
  const fetchUpcomingLanes = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!lifeguardId) {
        throw new Error("Lifeguard ID not found. Please log in again.");
      }

      // Adjust the endpoint to match your lane-based logic
      const response = await axios.get(
        `http://127.0.0.1:8000/api/lifeguard_upcoming_hours/?lifeguard_id=${lifeguardId}`
      );

      // The response should have an "upcoming_hours" array
      if (response.data.upcoming_hours) {
        setUpcomingLanes(response.data.upcoming_hours);
      } else {
        setUpcomingLanes([]);
      }
    } catch (err) {
      console.error("Error fetching upcoming lanes:", err);
      // Use either the backend error or a fallback
      setError(
        err.response?.data?.error ||
        err.message ||
        "Failed to fetch upcoming lanes."
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle cancellation of a lane booking
   * (Requires a cancel-lane endpoint on your backend)
   */
  const handleCancel = async (lane) => {
    try {
      // Call your "cancel lane" endpoint; adjust URL as needed
      const response = await axios.post(
        "http://127.0.0.1:8000/api/lifeguard_cancel_shift/",
        {
          lane_id: lane.lane_id,
        }
      );

      if (response.status === 200) {
        // Remove the canceled lane from the local state
        setUpcomingLanes((prev) => prev.filter((l) => l.lane_id !== lane.lane_id));
        alert("Lane booking has been canceled successfully.");
      } else {
        alert("Failed to cancel lane. Please try again.");
      }
    } catch (error) {
      console.error("Error canceling lane:", error);
      alert(
        error.response?.data?.error ||
        "An error occurred while canceling the lane."
      );
    }
  };

  // Fetch the upcoming lanes on component mount
  useEffect(() => {
    fetchUpcomingLanes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <LayoutLifeguard>
      <div className="upcoming-hours-container">
        <h1 className="upcoming-hours-heading">Upcoming Lane Bookings</h1>

        {loading && <p>Loading upcoming lanes...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && !error && (
          <div className="working-hours-list">
            {upcomingLanes.length > 0 ? (
              upcomingLanes.map((lane) => (
                <div key={lane.lane_id} className="working-hour-item">
                  <div className="working-hour-info">
                    <p><strong>Lane ID:</strong> {lane.lane_id}</p>
                    <p><strong>Pool ID:</strong> {lane.pool_id}</p>
                    <p><strong>Lane Number:</strong> {lane.lane_number}</p>
                    <p>
                      <strong>Date:</strong>{" "}
                      {lane.start_date} - {lane.end_date}
                    </p>
                    <p>
                      <strong>Time:</strong>{" "}
                      {lane.start_time} - {lane.end_time}
                    </p>
                    <p><strong>Availability:</strong> {lane.availability}</p>
                    <p><strong>Price:</strong> {lane.booking_price} TL</p>
                  </div>
                  <div className="working-hour-actions">
                    <button
                      className="cancel-button"
                      onClick={() => handleCancel(lane)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-working-hours-message">
                No upcoming lane bookings scheduled.
              </p>
            )}
          </div>
        )}
      </div>
    </LayoutLifeguard>
  );
};

export default UpcomingHours;
