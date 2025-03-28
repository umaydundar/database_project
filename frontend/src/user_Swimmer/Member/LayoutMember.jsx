import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './LayoutMember.css';
import 'boxicons/css/boxicons.min.css';
import axios from 'axios';

const LayoutMember = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // State for user balance
  const [balance, setBalance] = useState(0);

  // State for modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);

  // States for form inputs
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('creditCard'); // Default payment method
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [venmoUsername, setVenmoUsername] = useState('');

  // States for feedback messages
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Determine user role
  const userRole = localStorage.getItem('userRole') || 'member'; // Default to 'member'

  
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const swimmer_id = localStorage.getItem("swimmerId");
        if (!swimmer_id) throw new Error("Swimmer ID not found");

        const response = await axios.get(`http://127.0.0.1:8000/api/get_member/?user_id=${swimmer_id}`, {
          withCredentials: true,
        });

        if (response.status === 200) {
          if(response.data.member.balance != null){
            setBalance(response.data.member.balance);
          }
          else
          {
            setBalance(0);
          }
        } else {
          console.error("Failed to fetch balance:", response);
        }
      } catch (err) {
        console.error("Error fetching balance:", err);
      }
    };

    fetchBalance();
  }, []);


  // Function to open the modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setFormError('');
    setFormSuccess('');
    // Reset form fields
    setAmount('');
    setPaymentMethod('creditCard');
    setCardNumber('');
    setCardHolder('');
    setExpiryDate('');
    setCvv('');
    setPaypalEmail('');
    setVenmoUsername('');
  };

  // Function to handle form submission
  const handleFormSubmit = (e) => {
    e.preventDefault();

    // Basic form validation
    if (!amount || amount <= 0) {
      setFormError('Please enter a valid positive amount.');
      setFormSuccess('');
      return;
    }

    // Payment method specific validation
    if (paymentMethod === 'creditCard') {
      const cardNumberRegex = /^\d{16}$/;
      if (!cardNumberRegex.test(cardNumber)) {
        setFormError('Please enter a valid 16-digit card number.');
        setFormSuccess('');
        return;
      }

      const expiryDateRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
      if (!expiryDateRegex.test(expiryDate)) {
        setFormError('Please enter a valid expiry date in MM/YY format.');
        setFormSuccess('');
        return;
      }

      const cvvRegex = /^\d{3}$/;
      if (!cvvRegex.test(cvv)) {
        setFormError('Please enter a valid 3-digit CVV.');
        setFormSuccess('');
        return;
      }
    } else if (paymentMethod === 'paypal') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(paypalEmail)) {
        setFormError('Please enter a valid PayPal email address.');
        setFormSuccess('');
        return;
      }
    } else if (paymentMethod === 'venmo') {
      if (!venmoUsername.trim()) {
        setFormError('Please enter your Venmo username.');
        setFormSuccess('');
        return;
      }
    }

    // **Important:** In production, handle payment processing securely using a payment gateway.

    // Simulate adding money (for demonstration purposes)
    const newBalance = balance + parseFloat(amount);
    setBalance(newBalance);
    localStorage.setItem('balance', newBalance.toString());

    // Provide success feedback
    setFormSuccess(`Successfully added ${parseFloat(amount)} TL to your balance.`);
    setFormError('');

    // Optionally, close the modal after a delay
    setTimeout(() => {
      closeModal();
    }, 2000);
  };

  const handleLogout = () => {
    // Perform logout operations here (e.g., remove tokens)
    // Remove user role and other relevant data
    localStorage.removeItem('userRole');
    localStorage.removeItem('userPoints'); // Clear user points on logout
    localStorage.removeItem('balance'); // Clear balance on logout
    navigate('/'); // Redirect to Home or Login page
  };

  return (
      <div className="sidebar always-open">
        <div className="sidebar-content">
          {/* Logo Section */}
          <div className="logo">
            <i className='bx bx-water icon'></i> {/* Optional: Replace with desired icon */}
            <span className="logo-name">Pool Launcher</span>
          </div>

          {/* Balance View */}
          <div className="balance-view">
            <div className="balance-info">
              <span className="balance-label">Balance:</span>
              <span className="balance-amount">{balance} TL</span>
            </div>
            <button className="add-money-button" onClick={openModal} title="Add Money">
              <i className='bx bx-plus-circle'></i>
            </button>
          </div>

          {/* Navigation Links */}
          <ul className="lists">
            <li className={`list ${location.pathname === '/member/profile' ? 'active' : ''}`}>
              <Link to="/member/profile" className="nav-link">
                <i className="bx bx-user icon"></i>
                <span className="link">Profile</span>
              </Link>
            </li>
            <li className={`list ${location.pathname === '/member/my-courses' ? 'active' : ''}`}>
              <Link to="/member/my-courses" className="nav-link">
                <i className="bx bx-book icon"></i>
                <span className="link">My Courses</span>
              </Link>
            </li>
            <li className={`list ${location.pathname === '/member/all-courses' ? 'active' : ''}`}>
              <Link to="/member/all-courses" className="nav-link">
                <i className="bx bx-book-open icon"></i>
                <span className="link">All Courses</span>
              </Link>
            </li>
          </ul>

          {/* Logout Button */}
          <div className="bottom-content">
            <li className="list">
              <button onClick={handleLogout} className="nav-link">
                <i className="bx bx-log-out icon"></i>
                <span className="link">Log out</span>
              </button>
            </li>
          </div>
        </div>

        {/* Modal Overlay */}
        {isModalOpen && (
            <div className="modal-overlay" onClick={closeModal}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Add Money to Balance</h2>
                <form onSubmit={handleFormSubmit} className="add-money-form">
                  <div className="form-group">
                    <label htmlFor="amount">Amount to Add<span className="required">*</span></label>
                    <input
                        type="number"
                        id="amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        min="1"
                        placeholder="Enter amount in points"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="paymentMethod">Payment Method<span className="required">*</span></label>
                    <select
                        id="paymentMethod"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        required
                    >
                      <option value="creditCard">Credit Card</option>
                      <option value="paypal">PayPal</option>
                      <option value="venmo">Venmo</option>
                    </select>
                  </div>

                  {/* Conditional Rendering of Payment Fields */}
                  {paymentMethod === 'creditCard' && (
                      <>
                        <div className="form-group">
                          <label htmlFor="cardNumber">Card Number<span className="required">*</span></label>
                          <input
                              type="text"
                              id="cardNumber"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                              required
                              maxLength="16"
                              placeholder="Enter 16-digit card number"
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="cardHolder">Card Holder Name<span className="required">*</span></label>
                          <input
                              type="text"
                              id="cardHolder"
                              value={cardHolder}
                              onChange={(e) => setCardHolder(e.target.value)}
                              required
                              placeholder="Enter card holder name"
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="expiryDate">Expiry Date (MM/YY)<span className="required">*</span></label>
                          <input
                              type="text"
                              id="expiryDate"
                              value={expiryDate}
                              onChange={(e) => setExpiryDate(e.target.value)}
                              required
                              placeholder="MM/YY"
                              maxLength="5"
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="cvv">CVV<span className="required">*</span></label>
                          <input
                              type="password"
                              id="cvv"
                              value={cvv}
                              onChange={(e) => setCvv(e.target.value)}
                              required
                              maxLength="3"
                              placeholder="Enter 3-digit CVV"
                          />
                        </div>
                      </>
                  )}

                  {paymentMethod === 'paypal' && (
                      <div className="form-group">
                        <label htmlFor="paypalEmail">PayPal Email<span className="required">*</span></label>
                        <input
                            type="email"
                            id="paypalEmail"
                            value={paypalEmail}
                            onChange={(e) => setPaypalEmail(e.target.value)}
                            required
                            placeholder="Enter your PayPal email"
                        />
                      </div>
                  )}

                  {paymentMethod === 'venmo' && (
                      <div className="form-group">
                        <label htmlFor="venmoUsername">Venmo Username<span className="required">*</span></label>
                        <input
                            type="text"
                            id="venmoUsername"
                            value={venmoUsername}
                            onChange={(e) => setVenmoUsername(e.target.value)}
                            required
                            placeholder="Enter your Venmo username"
                        />
                      </div>
                  )}

                  {formError && <p className="error-message">{formError}</p>}
                  {formSuccess && <p className="success-message">{formSuccess}</p>}
                  <div className="form-actions">
                    <button type="submit" className="submit-button">Add Money</button>
                    <button type="button" className="cancel-button" onClick={closeModal}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
        )}
      </div>
  );
};

export default LayoutMember;
