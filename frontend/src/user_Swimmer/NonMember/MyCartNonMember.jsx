// MyCartNonMember.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from './LayoutNonMember.jsx';
import './MyCartNonMember.css';
import { useCart } from './CartContextNonmember'; // Adjust path as necessary

const MyCartNonMember = () => {
    const { cartItems, removeFromCart, clearCart } = useCart();

    const [paymentMethod, setPaymentMethod] = useState('Credit Card');
    // Use 'now' to calculate time left for each item
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        if (cartItems.length === 0) return;

        // Update 'now' every second
        const timer = setInterval(() => {
            setNow(Date.now());

            // Iterate over cartItems to check for expired items
            cartItems.forEach(item => {
                if (item.expirationTime <= Date.now()) {
                    removeFromCart(item.id);
                    alert(`"${item.title}" has expired and been removed from your cart.`);
                }
            });
        }, 1000);

        // Cleanup interval on unmount or when cartItems change
        return () => clearInterval(timer);
    }, [cartItems, removeFromCart]);

    // Function to format time left
    const formatTime = (timeInMs) => {
        const totalSeconds = Math.floor(timeInMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // Calculate total price
    const totalPrice = cartItems.reduce((sum, item) => sum + (item.price || 0), 0);

    // Handle payment method change
    const handlePaymentChange = (e) => {
        setPaymentMethod(e.target.value);
    };

    // Handle purchase action
    const handlePurchase = () => {
        alert(
            `You have purchased ${cartItems.length} course(s) for a total of $${totalPrice}. Payment method: ${paymentMethod}.`
        );
        clearCart();
        // Optionally reset 'now'
        setNow(Date.now());
    };

    // Handle removing an item
    const handleRemoveItem = (courseId) => {
        removeFromCart(courseId);
    };

    return (
        <div className="mycart-main-container">
            <div className="mycart-bottom-container">
                <Sidebar />
                <div className="mycart-content-container">
                    <h1 className="mycart-heading">My Cart</h1>

                    <div className="mycart-cart-items">
                        {cartItems.length > 0 ? (
                            cartItems.map((item) => {
                                // Calculate time left for each item
                                const timeLeftMs = item.expirationTime - now;
                                const timeLeftStr = timeLeftMs > 0 ? formatTime(timeLeftMs) : 'Expired';

                                return (
                                    <div key={item.id} className="mycart-cart-item">
                                        <div className="mycart-item-details">
                                            <h2>{item.title}</h2>
                                            <p>
                                                <strong>Instructor:</strong> {item.instructor}
                                            </p>
                                            <p>
                                                <strong>Duration:</strong> {item.duration}
                                            </p>
                                            <p>
                                                <strong>Price:</strong> ${item.price || 0}
                                            </p>
                                            {/* Display individual countdown */}
                                            {timeLeftMs > 0 ? (
                                                <p style={{ color: 'red' }}>
                                                    <strong>Time Left:</strong> {timeLeftStr}
                                                </p>
                                            ) : (
                                                <p style={{ color: 'gray' }}>Expired</p>
                                            )}
                                        </div>
                                        <button
                                            className="mycart-remove-button"
                                            onClick={() => handleRemoveItem(item.id)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="mycart-empty">Your cart is empty.</p>
                        )}
                    </div>

                    {cartItems.length > 0 && (
                        <>
                            <div className="mycart-total">
                                <h2>Total: ${totalPrice}</h2>
                            </div>

                            <div className="mycart-payment-method">
                                <label htmlFor="payment-method">
                                    <strong>Select Payment Method:</strong>
                                </label>
                                <select
                                    id="payment-method"
                                    value={paymentMethod}
                                    onChange={handlePaymentChange}
                                    className="mycart-payment-select"
                                >
                                    <option value="Credit Card">Credit Card</option>
                                    <option value="PayPal">PayPal</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                </select>
                            </div>

                            <button className="mycart-purchase-button" onClick={handlePurchase}>
                                Purchase
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyCartNonMember;
