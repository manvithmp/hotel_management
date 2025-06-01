const Order = require('../models/Order');
const Table = require('../models/Table');

const CHEFS = [
  'Manvith',
  'Sagar',
  'Mranal',
  'Aditya',
  'Kenji'
];

exports.getDashboardMetrics = async (req, res) => {
  try {
    const revenueAgg = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    const totalOrders = await Order.countDocuments();

    const uniqueClients = await Order.distinct('user.mobile');
    const totalClients = uniqueClients.length;

    res.json({
      revenue: `₹${totalRevenue.toFixed(2)}`,
      orders: totalOrders,
      clients: totalClients,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
};

exports.getTables = async (req, res) => {
  try {
    const tables = await Table.find();
    res.json(tables);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tables' });
  }
};

exports.getChefOrders = async (req, res) => {
  try {
    const orders = await Order.aggregate([
      { $group: { _id: "$chef", count: { $sum: 1 } } }
    ]);
    const chefOrderCounts = CHEFS.map(name => {
      const found = orders.find(o => o._id === name);
      return { name, orders: found ? found.count : 0 };
    });
    res.json(chefOrderCounts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chef orders' });
  }
};