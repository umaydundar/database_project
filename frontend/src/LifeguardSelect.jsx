// Lifeguards.jsx
import React, { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import './LifeguardSelect.css';

const LifeguardSelect = () => {
    // State to track selected facility
    const [selectedFacility, setSelectedFacility] = useState(null);

    // State to track selected time slots
    const [selectedSlots, setSelectedSlots] = useState([]);

    // Time slots
    const timeSlots = [
        '8:00 AM - 10:00 AM',
        '10:00 AM - 12:00 PM',
        '12:00 PM - 2:00 PM',
        '2:00 PM - 4:00 PM',
        '4:00 PM - 6:00 PM',
        '6:00 PM - 8:00 PM',
    ];

    // Handle selecting a facility
    const handleSelectFacility = (facility) => {
        setSelectedFacility(facility);
        setSelectedSlots([]); // Reset time slots when facility changes
    };

    // Handle toggling a time slot
    const handleToggleSlot = (slot) => {
        if (selectedSlots.includes(slot)) {
            setSelectedSlots(selectedSlots.filter((s) => s !== slot));
        } else {
            setSelectedSlots([...selectedSlots, slot]);
        }
    };

    // Handle saving availability
    const handleSaveAvailability = () => {
        if (!selectedFacility) {
            alert('Please select a facility.');
            return;
        }

        if (selectedSlots.length === 0) {
            alert('Please select at least one time slot.');
            return;
        }

        const availability = {
            facility: selectedFacility,
            slots: selectedSlots,
        };

        console.log('Availability saved:', availability);
        alert(`Your availability for ${selectedFacility} has been saved!`);
    };

    return (
        <div className="lifeguards-main-container">
            <div className="lifeguards-bottom-container">
                <Sidebar />
                <div className="lifeguards-content-container">
                    <h1 className="lifeguards-heading">Lifeguard Management</h1>

                    {/* Step 1: Select Facility */}
                    <section className="lifeguards-section">
                        <h2>Select a Facility</h2>
                        <div className="lifeguards-facility-buttons">
                            <button
                                className={`lifeguards-facility-button ${
                                    selectedFacility === 'Facility 1' ? 'active' : ''
                                }`}
                                onClick={() => handleSelectFacility('Facility 1')}
                            >
                                Facility 1
                            </button>
                            <button
                                className={`lifeguards-facility-button ${
                                    selectedFacility === 'Facility 2' ? 'active' : ''
                                }`}
                                onClick={() => handleSelectFacility('Facility 2')}
                            >
                                Facility 2
                            </button>
                        </div>
                    </section>

                    {/* Step 2: Select Time Slots */}
                    {selectedFacility && (
                        <section className="lifeguards-section">
                            <h2>Select Available Time Slots for {selectedFacility}</h2>
                            <div className="lifeguards-time-slots">
                                {timeSlots.map((slot) => (
                                    <button
                                        key={slot}
                                        className={`lifeguards-time-slot ${
                                            selectedSlots.includes(slot) ? 'selected' : ''
                                        }`}
                                        onClick={() => handleToggleSlot(slot)}
                                    >
                                        {slot}
                                    </button>
                                ))}
                            </div>
                            <button
                                className="lifeguards-save-button"
                                onClick={handleSaveAvailability}
                            >
                                Save Availability
                            </button>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LifeguardSelect;
