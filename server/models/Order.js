const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  qty: { type: Number, required: true }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  location: { type: String } 
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true }, 
  type: { type: String, enum: ['dinein', 'takeaway'], required: true },
  time: { type: Date, default: Date.now },
  table: { type: String },
  items: [itemSchema],
  totalItems: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  user: userSchema,
  cookingNotes: { type: String },
  pickedUp: { type: Boolean, default: false },
  chef: { type: String, required: true }, 
});

module.exports = mongoose.model('Order', orderSchema);