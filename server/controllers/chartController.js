const Order = require('../models/Order');

function getDateRange(range) {
  const now = new Date();
  let start, end;
  end = new Date(now);
  if (range === 'daily') {
    start = new Date(now);
    start.setHours(0, 0, 0, 0);
  } else if (range === 'weekly') {
    start = new Date(now);
    start.setDate(now.getDate() - 6);
    start.setHours(0, 0, 0, 0);
  } else if (range === 'monthly') {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  } else {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  }
  return { start, end };
}

exports.getOrderSummaryChart = async (req, res) => {
  try {
    const range = req.query.range || 'weekly';
    const { start, end } = getDateRange(range);

    const data = await Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: "$type", count: { $sum: 1 } } }
    ]);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Failed to get order summary' });
  }
};

exports.getRevenueChart = async (req, res) => {
  try {
    const range = req.query.range || 'weekly';
    const { start, end } = getDateRange(range);
    const pricePerOrder = 600;

    let groupFormat, labelProject;
    if (range === 'daily') {
      groupFormat = { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" } };
      labelProject = {
        $concat: [
          { $toString: "$_id.day" },
          "-",
          { $toString: "$_id.month" }
        ]
      };
    } else if (range === 'weekly') {
      groupFormat = { year: { $year: "$createdAt" }, week: { $isoWeek: "$createdAt" } };
      labelProject = { $concat: ["Week ", { $toString: "$_id.week" }, " (", { $toString: "$_id.year" }, ")"] };
    } else {
      groupFormat = { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } };
      labelProject = { $concat: ["Month ", { $toString: "$_id.month" }, " (", { $toString: "$_id.year" }, ")"] };
    }

    const data = await Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: groupFormat, orderCount: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.week": 1, "_id.day": 1 } },
      { $project: {
          _id: 0,
          label: labelProject,
          revenue: { $multiply: ["$orderCount", pricePerOrder] }
        }
      }
    ]);

    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Failed to get revenue chart' });
  }
};