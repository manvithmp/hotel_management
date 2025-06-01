import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Menu.css';

const Menu = () => {
  const [showModal, setShowModal] = useState(false);
  const [dishName, setDishName] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');
  const [price, setPrice] = useState('');
  const [dishes, setDishes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleAddDish = async () => {
    if (!dishName || !category || !image || !price) return;

    const newDish = {
      name: dishName,
      category: category.trim().toLowerCase(),
      image,
      price: parseFloat(price)
    };

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/dishes`, newDish);
      setShowModal(false);
      setDishName('');
      setCategory('');
      setImage('');
      setPrice('');
      fetchDishes();
    } catch (error) {
      console.error('Error adding dish:', error);
    }
  };

  const handleDeleteDish = async (id) => {
    if (!window.confirm('Delete this dish?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/dishes/${id}`);
      fetchDishes();
    } catch (error) {
      console.error('Error deleting dish:', error);
    }
  };

  const filteredDishes = dishes.filter(dish =>
    dish.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const groupedDishes = filteredDishes.reduce((acc, dish) => {
    const cat = dish.category.charAt(0).toUpperCase() + dish.category.slice(1).toLowerCase();
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(dish);
    return acc;
  }, {});

  return (
    <div className="menu-container">
      <div className="menu-header">
        <div>
          <h2>Menu</h2>
          <p>Manage and view all your dishes by category</p>
        </div>
        <button className="add-btn" onClick={() => setShowModal(true)}>Add Dish</button>
      </div>
      <input
        className="search-bar"
        type="text"
        placeholder="Search dishes..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {Object.keys(groupedDishes).length === 0 ? (
        <div className="no-dishes">No dishes found.</div>
      ) : (
        Object.keys(groupedDishes).map((categoryName) => (
          <div key={categoryName} className="category-section">
            <h2>{categoryName}</h2>
            <div className="dish-grid">
              {groupedDishes[categoryName].map((dish) => (
                <div className="dish-card" key={dish._id || dish.id}>
                  <img src={dish.image} alt={dish.name} />
                  <div className="dish-info">
                    <span>{dish.name}</span>
                  </div>
                  <div className="price-row">
                    <span>₹{Number(dish.price).toFixed(2)}</span>
                    <button
                      className="remove-btn"
                      onClick={() => handleDeleteDish(dish._id || dish.id)}
                    >Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New Dish</h3>
            <input
              type="text"
              placeholder="Dish Name"
              value={dishName}
              onChange={(e) => setDishName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            <input
              type="text"
              placeholder="Image URL"
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
            <input
              type="number"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="0"
              step="0.01"
            />
            <button className="confirm-btn" onClick={handleAddDish}>Add</button>
            <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;