import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import './ChartStyles.css';

function formatCurrency(value) {
  return value?.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }) || '₹0';
}

const ranges = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' }
];

function RevenueChart() {
  const [range, setRange] = useState('weekly');
  const [data, setData] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${API_URL}/api/chart/revenue?range=${range}`)
      .then(res => res.json())
      .then(apiData => {
        const processed = Array.isArray(apiData)
          ? apiData.map(d => ({
              ...d,
              revenue: typeof d.revenue === "string"
                ? parseFloat(d.revenue.replace(/[₹,]/g, '')) || 0
                : (d.revenue ?? 0)
            }))
          : [];
        setData(processed);
      })
      .catch(console.error);
  }, [range, API_URL]);

  const totalRevenue = data.reduce((sum, d) => sum + (d.revenue || 0), 0);

  return (
    <div
      className="chart-container"
      style={{
        boxShadow: "0 2px 16px 0 rgba(80,112,174,0.07)",
        borderRadius: 16,
        background: "#fff",
        padding: "1.5rem 2rem 1.5rem 1.5rem",
        minHeight: 350,
        maxWidth: 650,
        margin: "0 auto"
      }}
    >
      <div className="chart-header" style={{ alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontWeight: 700, color: "#22223B", fontSize: 24, letterSpacing: 0.2 }}>Revenue Trend</h3>
        <FormControl size="small" variant="outlined" style={{ minWidth: 110 }}>
          <InputLabel id="range-label">Range</InputLabel>
          <Select
            labelId="range-label"
            value={range}
            onChange={e => setRange(e.target.value)}
            label="Range"
            sx={{ background: "#fff", borderRadius: "6px" }}
          >
            {ranges.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
      <div style={{
        fontWeight: 600,
        color: '#3D405B',
        marginBottom: 8,
        fontSize: 18,
        letterSpacing: 0.2
      }}>
        Total Revenue: <span style={{ color: "#1461ff" }}>{formatCurrency(totalRevenue)}</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="4 4" stroke="#e9ecef"/>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 14, fill: '#888' }}
            axisLine={false}
            tickLine={false}
            padding={{ left: 10, right: 10 }}
          />
          <YAxis
            tickFormatter={formatCurrency}
            tick={{ fontSize: 14, fill: '#888' }}
            width={80}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={v => formatCurrency(v)}
            labelStyle={{ color: '#3D405B', fontWeight: 600 }}
            contentStyle={{ borderRadius: 12, background: "#fff", border: "1px solid #eaeaea", boxShadow: "0 8px 24px 0 rgba(80,112,174,0.07)" }}
            itemStyle={{ fontSize: 15 }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#1976d2 "
            strokeWidth={3}
            dot={{
              r: 5,
              fill: "#fff",
              stroke: "#1976d2 ",
              strokeWidth: 2
            }}
            activeDot={{
              r: 8,
              fill: "#fff",
              stroke: "#1461ff",
              strokeWidth: 3
            }}
            isAnimationActive={true}
            animationDuration={1100}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RevenueChart;