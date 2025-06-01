import React, { useEffect, useState, useMemo } from 'react';
import './Dashboard.css';
import RevenueChart from './RevenueChart';
import OrderSummaryChart from './OrderSummaryChart';

function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

function Dashboard() {
  const [metrics, setMetrics] = useState({ revenue: '₹0', orders: 0, clients: 0 });
  const [tables, setTables] = useState([]);
  const [chefs, setChefs] = useState([]);
  const [filter, setFilter] = useState('');

  const API_URL = import.meta.env.VITE_API_URL;
  const debouncedFilter = useDebouncedValue(filter, 200);
  const lowerFilter = debouncedFilter.trim().toLowerCase();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsRes, tablesRes, chefsRes] = await Promise.all([
          fetch(`${API_URL}/api/dashboard/metrics`),
          fetch(`${API_URL}/api/dashboard/tables`),
          fetch(`${API_URL}/api/dashboard/chefs`)
        ]);
        setMetrics(await metricsRes.json());
        setTables(await tablesRes.json());
        setChefs(await chefsRes.json());
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    fetchData();
  }, [API_URL]);

  const metricsCards = [
    {
      key: 'chef',
      label: 'TOTAL CHEF',
      value: chefs.length,
      match: ['chef', 'chefs'],
    },
    {
      key: 'revenue',
      label: 'TOTAL REVENUE',
      value: metrics.revenue,
      match: ['revenue', 'money', 'income'],
    },
    {
      key: 'orders',
      label: 'TOTAL ORDERS',
      value: metrics.orders,
      match: ['order', 'orders'],
    },
    {
      key: 'clients',
      label: 'TOTAL CLIENTS',
      value: metrics.clients,
      match: ['client', 'clients', 'customer', 'customers'],
    }
  ];

  const showSection = (keywords) =>
    !lowerFilter ||
    keywords.some(keyword => keyword.includes(lowerFilter)) ||
    lowerFilter === '';

  const filteredChefs = useMemo(() => {
    if (!lowerFilter || ['chef', 'chefs'].some(k => lowerFilter.includes(k))) {
      return chefs.filter(chef => !lowerFilter || chef.name.toLowerCase().includes(lowerFilter));
    }
    return [];
  }, [chefs, lowerFilter]);

  return (
    <div className="dashboard-container">
      <div className="filter-bar" style={{marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8}}>
        <input
          placeholder="Filter dashboard"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{
            padding: '10px 40px 10px 16px',
            borderRadius: 24,
            border: '1.5px solid #2196f3',
            outline: 'none',
            fontSize: 16,
            background: '#f8fbff',
            color: '#222',
            boxShadow: '0 2px 8px rgba(33,150,243,0.04)',
            transition: 'border 0.2s',
            width: 300,
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg fill='gray' height='22' viewBox='0 0 24 24' width='22' xmlns='http://www.w3.org/2000/svg'><path d='M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99c.41.41 1.09.41 1.5 0s.41-1.09 0-1.5l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z'/></svg>\")",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
            backgroundSize: '22px 22px'
          }}
        />
        <div className="dropdown"></div>
      </div>

      <div className="analytics-section">
        {metricsCards
          .filter(card => showSection(card.match.concat(card.label.toLowerCase())))
          .map(card => (
            <div className="metrics-card" key={card.key}>
              <p className="label">{card.label}</p>
              <p className="value">{card.value}</p>
            </div>
        ))}
      </div>

      <div className="charts-section">
        {showSection(['order', 'orders']) && (
          <div className="chart-card">
            <OrderSummaryChart totalOrders={metrics.orders} />
          </div>
        )}
        {showSection(['revenue']) && (
          <div className="chart-card revenue-chart-card">
            <RevenueChart totalRevenue={metrics.revenue} />
          </div>
        )}
        {showSection(['table', 'tables']) && (
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
        )}
      </div>

      {showSection(['chef', 'chefs']) && (
        <div className="chef-orders">
          <table>
            <thead>
              <tr>
                <th>Chef Name</th>
                <th>Order Taken</th>
              </tr>
            </thead>
            <tbody>
              {filteredChefs.map((chef, index) => (
                <tr key={index}>
                  <td>{chef.name}</td>
                  <td>{String(chef.orders).padStart(2, '0')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Dashboard;