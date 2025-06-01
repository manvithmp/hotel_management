import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import RevenueChart from './RevenueChart';
import OrderSummaryChart from './OrderSummaryChart';

function Dashboard() {
  const [metrics, setMetrics] = useState({ revenue: '₹0', orders: 0, clients: 0 });
  const [tables, setTables] = useState([]);
  const [chefs, setChefs] = useState([
    { name: 'Manvith', orders: 0 },
    { name: 'Sagar', orders: 0 },
    { name: 'Mranal', orders: 0 },
    { name: 'Aditya', orders: 0 },
    { name: 'Kenji', orders: 0 }
  ]);

  useEffect(() => {
    const fetchData = async () => {

      const metricsRes = await fetch('http://localhost:5000/api/dashboard/metrics');
      setMetrics(await metricsRes.json());

      const tablesRes = await fetch('http://localhost:5000/api/dashboard/tables');
      setTables(await tablesRes.json());

      const chefsRes = await fetch('http://localhost:5000/api/dashboard/chefs');
      setChefs(await chefsRes.json());
    };

    fetchData();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="filter-bar">
        <input placeholder="Filter..." />
        <div className="dropdown"></div>
      </div>

      <div className="analytics-section">
        <div className="metrics-card">
          <p className="label">TOTAL CHEF</p>
          <p className="value">{chefs.length}</p>
        </div>
        <div className="metrics-card">
          <p className="label">TOTAL REVENUE</p>
          <p className="value">{metrics.revenue}</p>
        </div>
        <div className="metrics-card">
          <p className="label">TOTAL ORDERS</p>
          <p className="value">{metrics.orders}</p>
        </div>
        <div className="metrics-card">
          <p className="label">TOTAL CLIENTS</p>
          <p className="value">{metrics.clients}</p>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-card">
          <OrderSummaryChart totalOrders={metrics.orders} />
        </div>
        <div className="chart-card revenue-chart-card">
          <RevenueChart totalRevenue={metrics.revenue} />
        </div>
        <div className="chart-card table-card">
          <div className="table-header">
            <h4>Tables</h4>
            <div className="table-legend">
              <span className="legend reserved"><span className="dot"></span>Reserved</span>
              <span className="legend available"><span className="dot"></span>Available</span>
            </div>
          </div>
          <div className="table-grid-5">
            {tables.map((table) => (
              <div
                key={table._id}
                className={`table-block-5 ${table.reserved ? 'reserved' : 'available'}`}
              >
                <span className="table-number-5">{String(table.number).padStart(2, '0')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="chef-orders">
        <table>
          <thead>
            <tr>
              <th>Chef Name</th>
              <th>Order Taken</th>
            </tr>
          </thead>
          <tbody>
            {chefs.map((chef, index) => (
              <tr key={index}>
                <td>{chef.name}</td>
                <td>{String(chef.orders).padStart(2, '0')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;