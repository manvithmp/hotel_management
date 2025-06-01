const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  number: String,
  name: String,
  reserved: { type: Boolean, default: false },
  chairs: Number,
});

module.exports = mongoose.model('Table', tableSchema);