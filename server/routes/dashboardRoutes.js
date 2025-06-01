const express = require('express');
const router = express.Router();
const { getDashboardMetrics, getTables, getChefOrders } = require('../controllers/dashboardController');

router.get('/metrics', getDashboardMetrics);
router.get('/tables', getTables);
router.get('/chefs', getChefOrders);

module.exports = router;