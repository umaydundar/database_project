// CartContextNonmember.js
import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the Cart Context
const CartContext = createContext();

// Cart Provider Component
export const CartProvider = ({ children }) => {
    // Initialize cartItems from Local Storage or use an empty array
    const [cartItems, setCartItems] = useState(() => {
        try {
            const storedCart = localStorage.getItem('cartNonMember');
            if (storedCart) {
                const parsedCart = JSON.parse(storedCart);
                // Filter out any expired items
                const validCart = parsedCart.filter(item => item.expirationTime > Date.now());
                return validCart;
            } else {
                return [];
            }
        } catch (error) {
            console.error('Error parsing cart from Local Storage:', error);
            return [];
        }
    });

    // Persist cartItems to Local Storage whenever they change
    useEffect(() => {
        localStorage.setItem('cartNonMember', JSON.stringify(cartItems));
    }, [cartItems]);

    // Function to add a course to the cart with an expirationTime
    const addToCart = (course) => {
        setCartItems(prevCartItems => {
            // Check if the course is already in the cart
            const exists = prevCartItems.find(item => item.id === course.id);
            if (exists) {
                alert(`"${course.title}" is already in your cart.`);
                return prevCartItems;
            }

            // Set expiration time to 10 minutes from now
            const expirationTime = Date.now() + 10 * 60 * 1000; // 10 minutes in ms

            return [...prevCartItems, { ...course, expirationTime }];
        });
    };

    // Function to remove a course from the cart by ID
    const removeFromCart = (courseId) => {
        setCartItems(prevCartItems => prevCartItems.filter(item => item.id !== courseId));
    };

    // Function to clear the entire cart
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

// Custom hook to use the Cart Context
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
