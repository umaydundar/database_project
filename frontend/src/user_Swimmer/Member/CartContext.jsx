// CartContext.js
import React, { createContext, useContext, useState } from 'react';

// 1. Create a Context
const CartContext = createContext();

// 2. Create a Provider component
export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    // Add item to cart (only if not already added)
    const addToCart = (course) => {
        setCartItems((prevCartItems) => {
            const alreadyInCart = prevCartItems.find((item) => item.id === course.id);
            if (alreadyInCart) {
                // Already in cart; you might want to show a message or do nothing
                return prevCartItems;
            }
            return [...prevCartItems, course];
        });
    };

    // Remove item from cart
    const removeFromCart = (courseId) => {
        setCartItems((prevCartItems) => prevCartItems.filter((item) => item.id !== courseId));
    };

    // Clear entire cart
    const clearCart = () => {
        setCartItems([]);
    };

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                clearCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

// 3. Create a custom hook to consume the Context
export const useCart = () => {
    return useContext(CartContext);
};
