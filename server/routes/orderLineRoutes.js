const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Table = require('../models/Table');

router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ time: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const orderData = req.body;

    if (orderData.type === 'dinein' && !orderData.table) {
      const freeTable = await Table.findOne({ reserved: false });
      if (!freeTable)
        return res.status(400).json({ error: 'No free tables available' });
      orderData.table = freeTable.number;
      await Table.findByIdAndUpdate(freeTable._id, { reserved: true });
    }

    if (orderData.type === 'dinein' && orderData.table) {
      await Table.findOneAndUpdate({ number: orderData.table }, { reserved: true });
    }

    const order = new Order(orderData);
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;