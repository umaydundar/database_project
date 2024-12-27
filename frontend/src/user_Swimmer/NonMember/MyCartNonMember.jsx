// MyCart.jsx
import React, { useState } from 'react';
import Sidebar from './LayoutNonMember.jsx';
import './MyCartNonMember.css';

const MyCart = () => {
    // Mock data - Selected Courses in Cart
    const [cartItems, setCartItems] = useState([
        {
            id: 1,
            title: 'Beginner Swimming',
            instructor: 'John Doe',
            price: 100, // Price in USD
            duration: '8 weeks',
        },
        {
            id: 3,
            title: 'Advanced Swimming Techniques',
            instructor: 'Alice Johnson',
            price: 150,
            duration: '10 weeks',
        },
        // Add more courses as needed
    ]);

    const [paymentMethod, setPaymentMethod] = useState('Credit Card');

    // Calculate total price
    const totalPrice = cartItems.reduce((total, item) => total + item.price, 0);

    // Handle payment method change
    const handlePaymentChange = (e) => {
        setPaymentMethod(e.target.value);
    };

    // Handle Purchase action
    const handlePurchase = () => {
        // Implement your purchase logic here (e.g., API call)
        alert(`You have purchased ${cartItems.length} course(s) for a total of $${totalPrice}. Payment method: ${paymentMethod}.`);
        // Optionally, clear the cart after purchase
        setCartItems([]);
    };

    // Handle Remove Item from Cart
    const handleRemoveItem = (id) => {
        const updatedCart = cartItems.filter(item => item.id !== id);
        setCartItems(updatedCart);
    };

    return (
        <div className="mycart-main-container">
            <div className="mycart-bottom-container">
                <Sidebar />
                <div className="mycart-content-container">
                    <h1 className="mycart-heading">My Cart</h1>

                    {/* Cart Items */}
                    <div className="mycart-cart-items">
                        {cartItems.length > 0 ? (
                            cartItems.map((item) => (
                                <div key={item.id} className="mycart-cart-item">
                                    <div className="mycart-item-details">
                                        <h2>{item.title}</h2>
                                        <p><strong>Instructor:</strong> {item.instructor}</p>
                                        <p><strong>Duration:</strong> {item.duration}</p>
                                        <p><strong>Price:</strong> ${item.price}</p>
                                    </div>
                                    <button className="mycart-remove-button" onClick={() => handleRemoveItem(item.id)}>
                                        Remove
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="mycart-empty">Your cart is empty.</p>
                        )}
                    </div>

                    {/* Total Price */}
                    {cartItems.length > 0 && (
                        <div className="mycart-total">
                            <h2>Total: ${totalPrice}</h2>
                        </div>
                    )}

                    {/* Payment Method Selection */}
                    {cartItems.length > 0 && (
                        <div className="mycart-payment-method">
                            <label htmlFor="payment-method"><strong>Select Payment Method:</strong></label>
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
                    )}

                    {/* Purchase Button */}
                    {cartItems.length > 0 && (
                        <button className="mycart-purchase-button" onClick={handlePurchase}>
                            Purchase
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyCart;
