const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

const dashboardRoutes = require('./routes/dashboardRoutes');
const orderRoutes = require('./routes/OrderRoutes');
const dishRoutes = require('./routes/dishRoutes');
const chartRoutes = require('./routes/chartRoutes'); 
const tableRoutes = require('./routes/tableRoutes');
const orderLineRoutes = require('./routes/orderLineRoutes');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dishes', dishRoutes);
app.use('/api/chart', chartRoutes); 
app.use('/api/tables', tableRoutes);
app.use('/api/orderline', orderLineRoutes);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () => console.log(`Server running on port ${process.env.PORT || 5000}`));
  })
  .catch(err => console.error(err));