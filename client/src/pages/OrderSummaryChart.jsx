import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
Chart.register(ArcElement, Tooltip, Legend);

const rangeOptions = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' }
];

const OrderSummaryChart = () => {
  const [range, setRange] = useState('weekly');
  const [summary, setSummary] = useState({
    totalOrders: 0,
    totalDineIn: 0,
    totalTakeAway: 0,
    breakdown: []
  });

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${API_URL}/api/chart/order-summary?range=${range}`)
      .then(res => res.json())
      .then(setSummary)
      .catch(console.error);
  }, [range, API_URL]);

  const data = {
    labels: ['Dine In', 'Take Away'],
    datasets: [{
      data: [summary.totalDineIn, summary.totalTakeAway],
      backgroundColor: ['#2196f3', '#ff9800']
    }]
  };

  return (
    <div className="order-summary-chart">
      <div className="chart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Order Summary</h3>
        <div style={{ position: 'relative' }}>
          <select
            className="dropdown"
            style={{
              padding: '8px 32px 8px 12px',
              borderRadius: 8,
              border: '1px solidrgb(0, 0, 0)',
              background: '#fff url("data:image/svg+xml;utf8,<svg fill=\'%232196f3\' height=\'18\' viewBox=\'0 0 24 24\' width=\'18\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M7 10l5 5 5-5z\'/></svg>") no-repeat right 10px center/18px 18px',
              appearance: 'none',
              fontSize: 16,
              color: '#222',
              fontWeight: 500,
              minWidth: 120,
              cursor: 'pointer',
              transition: 'border 0.2s'
            }}
            value={range}
            onChange={e => setRange(e.target.value)}
          >
            {rangeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
      <Pie data={data} />
      <div style={{ marginTop: 16 }}>
        <div><strong>Total Orders:</strong> {summary.totalOrders}</div>
        <div><strong>Dine In:</strong> {summary.totalDineIn}</div>
        <div><strong>Take Away:</strong> {summary.totalTakeAway}</div>
      </div>
    </div>
  );
};

export default OrderSummaryChart;