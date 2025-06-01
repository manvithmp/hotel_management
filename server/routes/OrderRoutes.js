const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Table = require('../models/Table');

const CHEFS = [
  'Manvith',
  'Sagar',
  'Mranal',
  'Aditya',
  'Kenji'
];

async function getNextOrderId() {
  const lastOrder = await Order.findOne({})
    .sort({ time: -1 })
    .limit(1);

  let newId = 100;
  if (lastOrder && lastOrder.orderId) {
    const lastNum = parseInt(lastOrder.orderId.replace('#', ''), 10);
    if (!isNaN(lastNum)) newId = lastNum + 1;
  }
  return `#${newId}`;
}

function pickRandomChef() {
  return CHEFS[Math.floor(Math.random() * CHEFS.length)];
}

async function reserveRandomTable() {
  const unreservedTables = await Table.find({ reserved: false });
  if (unreservedTables.length === 0) {
    return null; 
  }
  const randomIndex = Math.floor(Math.random() * unreservedTables.length);
  const randomTable = unreservedTables[randomIndex];
  await Table.findByIdAndUpdate(randomTable._id, { reserved: true });
  return randomTable.number;
}

router.post('/', async (req, res) => {
  try {
    const { type, table, items, totalItems, totalPrice, user, cookingNotes } = req.body;

    if (
      !type ||
      !items ||
      !Array.isArray(items) ||
      !totalItems ||
      !user ||
      !user.name ||
      !user.mobile ||
      typeof totalPrice !== 'number'
    ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (type === 'takeaway' && !user.location) {
      return res.status(400).json({ error: 'Location required for takeaway' });
    }

    const orderId = await getNextOrderId();
    const chef = pickRandomChef();

    let assignedTable = table;
    if (type === 'dinein') {
      assignedTable = await reserveRandomTable();
      if (!assignedTable) {
        return res.status(400).json({ error: 'No available tables to reserve.' });
      }
    }

    const order = new Order({
      orderId,
      type,
      table: type === 'dinein' ? assignedTable : undefined,
      items,
      totalItems,
      totalPrice,
      user: {
        name: user.name,
        mobile: user.mobile,
        location: type === 'takeaway' ? user.location : undefined,
      },
      cookingNotes,
      chef
    });

    await order.save();
    res.status(201).json({ success: true, orderId, table: assignedTable });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;