import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GiPizzaSlice, GiCoffeeCup, GiMilkCarton } from 'react-icons/gi';
import { FaHamburger } from 'react-icons/fa';
import OrderCheckout from './OrderCheckout';
import './OrderPage.css';

const CATEGORY_ICONS = [
  { name: 'Pizza', icon: <GiPizzaSlice />, category: 'pizza' },
  { name: 'Burger', icon: <FaHamburger />, category: 'burger' },
  { name: 'Coffee', icon: <GiCoffeeCup />, category: 'coffee' },
  { name: 'Milkshake', icon: <GiMilkCarton />, category: 'milkshake' }
];

const OrderPage = () => {
  const [dishes, setDishes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [cart, setCart] = useState({});
  const [checkoutScreen, setCheckoutScreen] = useState(false);

  const fetchDishes = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/dishes`);
      if (Array.isArray(res.data)) {
        setDishes(res.data);
      } else {
        setDishes([]);
        console.error('Dishes response is not an array:', res.data);
      }
    } catch (error) {
      console.error('Error fetching dishes:', error);
      setDishes([]);
    }
  };

  useEffect(() => {
    fetchDishes();
  }, []);

  const filteredDishes = dishes.filter(dish => {
    const matchSearch = dish.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCat ? dish.category.toLowerCase() === selectedCat : true;
    return matchSearch && matchCat;
  });

  const groupedDishes = filteredDishes.reduce((acc, dish) => {
    const cat = dish.category.charAt(0).toUpperCase() + dish.category.slice(1).toLowerCase();
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(dish);
    return acc;
  }, {});

  const handleAddToCart = (dishId) => {
    setCart((prev) => ({
      ...prev,
      [dishId]: prev[dishId] ? prev[dishId] + 1 : 1
    }));
  };

  const handleIncrement = (dishId) => {
    setCart(prev => ({
      ...prev,
      [dishId]: prev[dishId] + 1
    }));
  };

  const handleDecrement = (dishId) => {
    setCart(prev => {
      if (prev[dishId] <= 1) {
        const { [dishId]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [dishId]: prev[dishId] - 1
      };
    });
  };

  const hasCartItems = Object.keys(cart).length > 0;

  const handleRemoveFromCart = (dishId) => {
    setCart((prev) => {
      const { [dishId]: _, ...rest } = prev;
      return rest;
    });
  };

  if (checkoutScreen) {
    return (
      <OrderCheckout
        cart={cart}
        dishes={dishes}
        onBack={() => setCheckoutScreen(false)}
        onOrderPlaced={() => {
          setCart({});
          setCheckoutScreen(false);
        }}
        handleRemoveFromCart={handleRemoveFromCart}
      />
    );
  }

  return (
    <div className="Order-container">
      <div className="Order-header">
        <div>
          <h2>Good evening!</h2>
          <p>Place your Order here!</p>
        </div>
      </div>
      <input
        className="search-bar"
        type="text"
        placeholder="Search dishes..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="category-icons-row">
        {CATEGORY_ICONS.map((cat) => (
          <button
            key={cat.category}
            className={`category-icon-btn${selectedCat === cat.category ? ' selected' : ''}`}
            onClick={() => setSelectedCat(selectedCat === cat.category ? '' : cat.category)}
            aria-label={cat.name}
            type="button"
          >
            <span className="category-icon">{cat.icon}</span>
            <span className="category-label">{cat.name}</span>
          </button>
        ))}
      </div>

      {Object.keys(groupedDishes).length === 0 ? (
        <div className="no-dishes">No dishes found.</div>
      ) : (
        Object.keys(groupedDishes).map((categoryName) => (
          <div key={categoryName} className="category-section">
            <h2>{categoryName}</h2>
            <div className="dish-grid">
              {groupedDishes[categoryName].map((dish) => {
                const inCart = cart[dish._id || dish.id] || 0;
                return (
                  <div className="dish-card dish-card-cart" key={dish._id || dish.id}>
                    <div className="dish-img-wrap">
                      <img src={dish.image} alt={dish.name} />
                      {!inCart && <div className="dish-img-gradient"></div>}
                    </div>
                    <div className="dish-info-cart">
                      <span className="dish-name">{dish.name}</span>
                      <div className="dish-bottom-row">
                        <span className="dish-price">₹ {Number(dish.price).toFixed(2)}</span>
                        {inCart ? (
                          <div className="cart-control">
                            <button className="cart-btn" onClick={() => handleDecrement(dish._id || dish.id)}>-</button>
                            <span className="cart-qty">{inCart}</span>
                            <button className="cart-btn" onClick={() => handleIncrement(dish._id || dish.id)}>+</button>
                          </div>
                        ) : (
                          <button className="add-to-cart-btn" onClick={() => handleAddToCart(dish._id || dish.id)}>
                            Add
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      {hasCartItems && (
        <button className="next-btn" onClick={() => setCheckoutScreen(true)}>Next</button>
      )}
    </div>
  );
};

export default OrderPage;