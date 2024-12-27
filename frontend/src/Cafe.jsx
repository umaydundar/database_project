// Cafe.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar.jsx';
import './Cafe.css';
import { useNavigate } from 'react-router-dom';

const Cafe = () => {
    const navigate = useNavigate();

    // State to hold cafe items
    const [cafeItems, setCafeItems] = useState([
        {
            id: 1,
            name: 'Fresh Juice',
            description: 'A refreshing blend of seasonal fruits.',
            price: 50, // Price in points
            image: 'https://via.placeholder.com/150', // Replace with actual image URLs
        },
        {
            id: 2,
            name: 'Protein Bar',
            description: 'High-protein snack for energy.',
            price: 30,
            image: 'https://via.placeholder.com/150',
        },
        {
            id: 3,
            name: 'Sandwich',
            description: 'Delicious sandwich with fresh ingredients.',
            price: 40,
            image: 'https://via.placeholder.com/150',
        },
        // Add more items as needed
    ]);

    // State for cart
    const [cart, setCart] = useState([]);

    // State for purchase confirmation
    const [purchaseConfirmed, setPurchaseConfirmed] = useState(false);

    // State for user's points
    const [userPoints, setUserPoints] = useState(0);

    // State for error messages
    const [errorMessage, setErrorMessage] = useState('');

    // Check membership status and retrieve user points on component mount
    useEffect(() => {
        const isMember = JSON.parse(localStorage.getItem('isMember'));
        if (!isMember) {
            // Redirect non-member users to Profile or Home page
            navigate('/cafe'); // Change the path as needed
        } else {
            // Retrieve user points from localStorage or initialize
            const points = JSON.parse(localStorage.getItem('userPoints')) || 0;
            setUserPoints(points);
        }
    }, [navigate]);

    // Handle adding items to cart (no point verification)
    const addToCart = (item) => {
        setCart([...cart, item]);
    };

    // Handle removing items from cart
    const removeFromCart = (index) => {
        const updatedCart = [...cart];
        updatedCart.splice(index, 1);
        setCart(updatedCart);
    };

    // Calculate total points required
    const totalPoints = cart.reduce((acc, item) => acc + item.price, 0);

    // Handle purchase
    const handlePurchase = () => {
        if (cart.length === 0) {
            alert('Your cart is empty.');
            return;
        }

        if (userPoints < totalPoints) {
            setErrorMessage('You do not have enough points to complete this purchase.');
            return;
        }

        // Deduct points and confirm purchase
        const remainingPoints = userPoints - totalPoints;
        setUserPoints(remainingPoints);
        localStorage.setItem('userPoints', JSON.stringify(remainingPoints));

        setCart([]);
        setPurchaseConfirmed(true);
        setErrorMessage('');

        // Optionally, store purchase details in localStorage or backend
        const purchases = JSON.parse(localStorage.getItem('cafe-purchases')) || [];
        const newPurchase = {
            id: Date.now(),
            items: cart,
            totalPoints: totalPoints,
            date: new Date().toISOString(),
        };
        localStorage.setItem('cafe-purchases', JSON.stringify([...purchases, newPurchase]));
    };

    return (
        <div className="cafe-main-container">
            <div className="cafe-bottom-container">
                <Sidebar />
                <div className="cafe-content-container">
                    <h1 className="cafe-heading">Cafe</h1>

                    {/* Display purchase confirmation */}
                    {purchaseConfirmed && (
                        <div className="cafe-purchase-confirmation">
                            <p>Thank you for your purchase!</p>
                        </div>
                    )}

                    {/* Display error message */}
                    {errorMessage && (
                        <div className="cafe-error-message">
                            <p>{errorMessage}</p>
                        </div>
                    )}

                    {/* Display user points balance */}
                    <div className="cafe-points-balance">
                        <p><strong>Your Points Balance:</strong> {userPoints} Points</p>
                        <p><strong>Total Points Required:</strong> {totalPoints} Points</p>
                        {totalPoints > userPoints && (
                            <p className="cafe-insufficient-points">You do not have enough points to complete this purchase.</p>
                        )}
                    </div>

                    {/* Cafe Items */}
                    <section className="cafe-section">
                        <h2>Available Items</h2>
                        <div className="cafe-items-list">
                            {cafeItems.map(item => (
                                <div key={item.id} className="cafe-item-card">
                                    <img src={item.image} alt={item.name} className="cafe-item-image" />
                                    <h3>{item.name}</h3>
                                    <p>{item.description}</p>
                                    <p><strong>Price:</strong> {item.price} Points</p>
                                    <button onClick={() => addToCart(item)} className="cafe-add-button">Add to Cart</button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Cart Section */}
                    <section className="cafe-cart-section">
                        <h2>Your Cart</h2>
                        {cart.length === 0 ? (
                            <p>Your cart is empty.</p>
                        ) : (
                            <div className="cafe-cart-list">
                                {cart.map((item, index) => (
                                    <div key={index} className="cafe-cart-item">
                                        <span>{item.name} - {item.price} Points</span>
                                        <button onClick={() => removeFromCart(index)} className="cafe-remove-button">Remove</button>
                                    </div>
                                ))}
                                <div className="cafe-cart-total">
                                    <strong>Total:</strong> {totalPoints} Points
                                </div>
                                <button
                                    onClick={handlePurchase}
                                    className="cafe-purchase-button"
                                    disabled={totalPoints > userPoints}
                                >
                                    Purchase
                                </button>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );

};

export default Cafe;
