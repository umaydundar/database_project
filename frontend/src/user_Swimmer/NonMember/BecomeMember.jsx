// Membership.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from './LayoutNonMember.jsx';
import './BecomeMember.css';

const Membership = () => {
    // Initialize memberships from localStorage or as an empty array
    const [memberships, setMemberships] = useState(() => {
        const savedMemberships = localStorage.getItem('membership-data');
        return savedMemberships ? JSON.parse(savedMemberships) : [];
    });

    // Form state
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        membershipPlan: 'Basic',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
    });

    // Submission status
    const [submissionStatus, setSubmissionStatus] = useState({
        success: null,
        message: '',
    });

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Simple validation functions
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePhone = (phone) => {
        const phoneRegex = /^[0-9]{10}$/;
        return phoneRegex.test(phone);
    };

    const validateCardNumber = (number) => {
        const cardRegex = /^[0-9]{16}$/;
        return cardRegex.test(number);
    };

    const validateExpiryDate = (date) => {
        if (!date) return false;
        const [year, month] = date.split('-').map(Number);
        const today = new Date();
        const expiry = new Date(year, month - 1);
        return expiry > today;
    };

    const validateCVV = (cvv) => {
        const cvvRegex = /^[0-9]{3,4}$/;
        return cvvRegex.test(cvv);
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        const { fullName, email, phone, address, membershipPlan, cardNumber, expiryDate, cvv } = formData;

        // Basic validation
        if (
            !fullName ||
            !email ||
            !phone ||
            !address ||
            !membershipPlan ||
            !cardNumber ||
            !expiryDate ||
            !cvv
        ) {
            setSubmissionStatus({
                success: false,
                message: 'Please fill in all required fields.',
            });
            return;
        }

        if (!validateEmail(email)) {
            setSubmissionStatus({
                success: false,
                message: 'Please enter a valid email address.',
            });
            return;
        }

        if (!validatePhone(phone)) {
            setSubmissionStatus({
                success: false,
                message: 'Please enter a valid 10-digit phone number.',
            });
            return;
        }

        if (!validateCardNumber(cardNumber)) {
            setSubmissionStatus({
                success: false,
                message: 'Please enter a valid 16-digit card number.',
            });
            return;
        }

        if (!validateExpiryDate(expiryDate)) {
            setSubmissionStatus({
                success: false,
                message: 'Please enter a valid expiry date.',
            });
            return;
        }

        if (!validateCVV(cvv)) {
            setSubmissionStatus({
                success: false,
                message: 'Please enter a valid 3 or 4-digit CVV.',
            });
            return;
        }

        // Create new membership entry
        const newMembership = {
            id: Date.now(),
            ...formData,
            registrationDate: new Date().toISOString(),
        };

        // Update state and localStorage
        const updatedMemberships = [...memberships, newMembership];
        setMemberships(updatedMemberships);
        localStorage.setItem('membership-data', JSON.stringify(updatedMemberships));

        // Reset form and set success message
        setFormData({
            fullName: '',
            email: '',
            phone: '',
            address: '',
            membershipPlan: 'Basic',
            cardNumber: '',
            expiryDate: '',
            cvv: '',
        });
        setSubmissionStatus({
            success: true,
            message: 'Thank you for registering! Your membership is now active.',
        });
    };

    return (
        <div className="membership-main-container">
            <div className="membership-bottom-container">
                <Sidebar />
                <div className="membership-content-container">
                    <h1 className="membership-heading">Become a Member</h1>

                    <form className="membership-form" onSubmit={handleSubmit}>
                        {/* Personal Information */}
                        <div className="membership-form-group">
                            <label htmlFor="fullName">Full Name<span className="required">*</span>:</label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="membership-form-group">
                            <label htmlFor="email">Email Address<span className="required">*</span>:</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="membership-form-group">
                            <label htmlFor="phone">Phone Number<span className="required">*</span>:</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                placeholder="e.g., 1234567890"
                            />
                        </div>

                        {/* Membership Plan */}
                        <div className="membership-form-group">
                            <label htmlFor="membershipPlan">Select Membership Plan<span className="required">*</span>:</label>
                            <select
                                id="membershipPlan"
                                name="membershipPlan"
                                value={formData.membershipPlan}
                                onChange={handleChange}
                                required
                            >
                                <option value="Basic">Basic - $50/month</option>
                            </select>
                        </div>

                        {/* Payment Information */}
                        <div className="membership-form-group">
                            <label htmlFor="cardNumber">Card Number<span className="required">*</span>:</label>
                            <input
                                type="text"
                                id="cardNumber"
                                name="cardNumber"
                                value={formData.cardNumber}
                                onChange={handleChange}
                                required
                                placeholder="1234 5678 9012 3456"
                                maxLength="19"
                            />
                        </div>

                        <div className="membership-form-group">
                            <label htmlFor="expiryDate">Expiry Date<span className="required">*</span>:</label>
                            <input
                                type="month"
                                id="expiryDate"
                                name="expiryDate"
                                value={formData.expiryDate}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="membership-form-group">
                            <label htmlFor="cvv">CVV<span className="required">*</span>:</label>
                            <input
                                type="text"
                                id="cvv"
                                name="cvv"
                                value={formData.cvv}
                                onChange={handleChange}
                                required
                                placeholder="123"
                                maxLength="4"
                            />
                        </div>

                        {/* Submission Status */}
                        {submissionStatus.message && (
                            <p className={`membership-message ${submissionStatus.success ? 'success' : 'error'}`}>
                                {submissionStatus.message}
                            </p>
                        )}

                        {/* Submit Button */}
                        <button type="submit" className="membership-submit-button">
                            Register
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );

};

export default Membership;
