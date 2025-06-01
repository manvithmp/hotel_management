const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

router.get('/revenue', async (req, res) => {
  const range = req.query.range || 'daily';
  let groupFormat, labelFormat, match = {};

  const now = new Date();
  if (range === 'weekly') {
    now.setHours(23,59,59,999);
    const from = new Date(now);
    from.setDate(now.getDate() - 6);
    match = { time: { $gte: from, $lte: now } };
    groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$time" } };
    labelFormat = '%Y-%m-%d';
  } else if (range === 'monthly') {
    now.setHours(23,59,59,999);
    const from = new Date(now);
    from.setDate(now.getDate() - 29);
    match = { time: { $gte: from, $lte: now } };
    groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$time" } };
    labelFormat = '%Y-%m-%d';
  } else if (range === 'yearly') {
    now.setHours(23,59,59,999);
    const from = new Date(now);
    from.setFullYear(now.getFullYear() - 1);
    match = { time: { $gte: from, $lte: now } };
    groupFormat = { $dateToString: { format: "%Y-%m", date: "$time" } };
    labelFormat = '%Y-%m';
  } else {
    now.setHours(23,59,59,999);
    const from = new Date(now);
    from.setHours(0,0,0,0);
    match = { time: { $gte: from, $lte: now } };
    groupFormat = { $hour: "$time" };
    labelFormat = 'hour';
  }

  const pipeline = [
    { $match: match },
    { $group: {
        _id: groupFormat,
        revenue: { $sum: "$totalPrice" }
      }
    },
    { $sort: { _id: 1 } }
  ];

  const orders = await Order.aggregate(pipeline);
  const chartData = orders.map(entry => ({
    label: typeof entry._id === 'number' ? `${entry._id}:00` : entry._id,
    revenue: entry.revenue
  }));
  res.json(chartData);
});

router.get('/order-summary', async (req, res) => {
  const range = req.query.range || 'weekly';
  let match = {};
  const now = new Date();

  if (range === 'weekly') {
    const from = new Date(now); from.setDate(now.getDate() - 6);
    match = { time: { $gte: from, $lte: now } };
  } else if (range === 'monthly') {
    const from = new Date(now); from.setDate(now.getDate() - 29);
    match = { time: { $gte: from, $lte: now } };
  } else if (range === 'yearly') {
    const from = new Date(now); from.setFullYear(now.getFullYear() - 1);
    match = { time: { $gte: from, $lte: now } };
  } else {
    now.setHours(0,0,0,0);
    const from = new Date(now);
    match = { time: { $gte: from, $lte: new Date() } };
  }

  const orders = await Order.find(match);
  const totalOrders = orders.length;
  const totalDineIn = orders.filter(o => o.type === 'dinein').length;
  const totalTakeAway = orders.filter(o => o.type === 'takeaway').length;
  const totalRevenue = orders.reduce(
    (acc, o) => acc + (o.totalPrice || 0), 0);

  res.json({
    totalOrders,
    totalDineIn,
    totalTakeAway,
    totalRevenue,
    breakdown: [
      { label: 'Dine In', value: totalDineIn },
      { label: 'Take Away', value: totalTakeAway },
      { label: 'Total Orders', value: totalOrders }
    ]
  });
});

module.exports = router;