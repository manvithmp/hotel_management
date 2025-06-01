const mongoose = require('mongoose');

const DishSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true }
});

module.exports = mongoose.model('Dish', DishSchema);
