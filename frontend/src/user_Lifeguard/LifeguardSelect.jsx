import React, { useState } from 'react';
import LayoutLifeguard from './LayoutLifeguard'; // Updated to match your layout structure
import './LifeguardSelect.css';

const LifeguardSelect = () => {
    const existingAvailabilities = {
        '2024-12-28': {
            'Facility 1': ['8:00 AM - 10:00 AM', '12:00 PM - 2:00 PM'],
            'Facility 2': ['10:00 AM - 12:00 PM'],
        },
        '2024-12-29': {
            'Facility 1': ['2:00 PM - 4:00 PM'],
            'Facility 2': ['4:00 PM - 6:00 PM', '6:00 PM - 8:00 PM'],
        },
    };

    const [selectedDate, setSelectedDate] = useState('');
    const [selectedFacility, setSelectedFacility] = useState(null);
    const [selectedSlots, setSelectedSlots] = useState([]);

    const timeSlots = [
        '8:00 AM - 10:00 AM',
        '10:00 AM - 12:00 PM',
        '12:00 PM - 2:00 PM',
        '2:00 PM - 4:00 PM',
        '4:00 PM - 6:00 PM',
        '6:00 PM - 8:00 PM',
    ];

    const handleSelectDate = (e) => {
        const selected = e.target.value;
        const today = new Date();
        const selectedDate = new Date(selected);

        if (selectedDate < today.setHours(0, 0, 0, 0)) {
            alert('You cannot select a date in the past. Please select a future date.');
            setSelectedDate('');
            setSelectedFacility(null);
            setSelectedSlots([]);
            return;
        }

        setSelectedDate(selected);
        setSelectedFacility(null);
        setSelectedSlots([]);
    };

    const handleSelectFacility = (facility) => {
        setSelectedFacility(facility);
        setSelectedSlots([]);
    };

    const handleToggleSlot = (slot) => {
        if (selectedSlots.includes(slot)) {
            setSelectedSlots(selectedSlots.filter((s) => s !== slot));
        } else {
            setSelectedSlots([...selectedSlots, slot]);
        }
    };

    const isSlotOccupied = (slot) => {
        return (
            existingAvailabilities[selectedDate]?.[selectedFacility]?.includes(slot) ||
            false
        );
    };

    const handleSaveAvailability = () => {
        if (!selectedDate) {
            alert('Please select a date.');
            return;
        }

        if (!selectedFacility) {
            alert('Please select a facility.');
            return;
        }

        if (selectedSlots.length === 0) {
            alert('Please select at least one time slot.');
            return;
        }

        const availability = {
            date: selectedDate,
            facility: selectedFacility,
            slots: selectedSlots,
        };

        console.log('Availability saved:', availability);
        alert(
            `Your working hours for ${selectedFacility} on ${selectedDate} have been saved!`
        );
    };

    return (
        <LayoutLifeguard>
            <div className="lifeguards-content-container">
                <h1 className="lifeguards-heading">Select Working Hours</h1>

                {/* Step 1: Select Date */}
                <section className="lifeguards-section">
                    <h2>Select a Date</h2>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={handleSelectDate}
                        required
                    />
                </section>

                {/* Step 2: Select Facility */}
                {selectedDate && (
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
                )}

                {/* Step 3: Select Time Slots */}
                {selectedFacility && (
                    <section className="lifeguards-section">
                        <h2>Working Hours for {selectedFacility}</h2>
                        <div className="lifeguards-time-slots">
                            {timeSlots.map((slot) => (
                                <button
                                    key={slot}
                                    className={`lifeguards-time-slot ${
                                        isSlotOccupied(slot)
                                            ? 'occupied'
                                            : selectedSlots.includes(slot)
                                            ? 'selected'
                                            : ''
                                    }`}
                                    onClick={() => !isSlotOccupied(slot) && handleToggleSlot(slot)}
                                    disabled={isSlotOccupied(slot)}
                                >
                                    {slot}
                                </button>
                            ))}
                        </div>
                        <button
                            className="lifeguards-save-button"
                            onClick={handleSaveAvailability}
                        >
                            Save Working Hours
                        </button>
                    </section>
                )}
            </div>
        </LayoutLifeguard>
    );
};

export default LifeguardSelect;
