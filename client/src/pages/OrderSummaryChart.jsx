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
      <div className="chart-header">
        <h3>Order Summary</h3>
        <select className="dropdown" value={range} onChange={e => setRange(e.target.value)}>
          {rangeOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
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