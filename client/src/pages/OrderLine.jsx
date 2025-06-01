import React, { useEffect, useState, useRef } from 'react';
import './OrderLine.css';
import { FaUtensils, FaHourglassHalf, FaCheckCircle, FaBox } from 'react-icons/fa';
import axios from 'axios';

const CATEGORY_TIMES = {
  pizza: 10,
  burger: 10,
  pasta: 10,
  coffee: 10,
  milkshake: 10,
};

const API_URL = `${import.meta.env.VITE_API_URL}/api/orderline`;

function getOrderDuration(order) {
  let max = 0;
  if (Array.isArray(order.items)) {
    for (const item of order.items) {
      let cat = item.category
        ? item.category.toLowerCase()
        : Object.keys(CATEGORY_TIMES).find(
            c => item.name && item.name.toLowerCase().includes(c)
          );
      if (cat && CATEGORY_TIMES[cat]) {
        max = Math.max(max, CATEGORY_TIMES[cat]);
      }
    }
  }
  return max || 10;
}

function getOrderStatus(order, now = new Date()) {
  const ORDER_DURATION = getOrderDuration(order) * 60 * 1000;
  const placedTime = new Date(order.time);
  const elapsed = now - placedTime;
  const remaining = Math.max(0, ORDER_DURATION - elapsed);
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  if (order.type === 'takeaway') {
    if (order.pickedUp) {
      return {
        color: 'green',
        status: 'Picked Up',
        btnText: 'Order Picked Up',
        icon: <FaCheckCircle />,
        timeText: '',
        showDropdown: false,
      };
    }
    if (elapsed < ORDER_DURATION) {
      return {
        color: 'orange',
        status: 'Processing',
        btnText: 'Processing',
        icon: <FaHourglassHalf />,
        timeText: `Ongoing: ${minutes} Min ${seconds} Sec`,
        showDropdown: false,
      };
    }
    return {
      color: 'grey',
      status: 'Not Picked Up',
      btnText: 'Not Picked Up',
      icon: <FaBox />,
      timeText: 'Ready for Pickup',
      showDropdown: true,
    };
  }

  if (elapsed < ORDER_DURATION) {
    return {
      color: 'orange',
      status: 'Processing',
      btnText: 'Processing',
      icon: <FaHourglassHalf />,
      timeText: `Ongoing: ${minutes} Min ${seconds} Sec`,
      showDropdown: false,
    };
  }
  return {
    color: 'green',
    status: 'Done',
    btnText: 'Order Done',
    icon: <FaCheckCircle />,
    timeText: 'Served',
    showDropdown: false,
  };
}

function getStatusBg(status) {
  switch (status) {
    case 'orange': return '#fcbf49';
    case 'green': return '#2ecc71';
    case 'grey': return '#bbbbbb';
    default: return '#fff';
  }
}

const OrderCard = ({ order, onPickUp }) => {
  const [status, setStatus] = useState(getOrderStatus(order));
  const timerRef = useRef();

  useEffect(() => {
    if (status.color === 'orange' || (order.type === 'takeaway' && status.color === 'grey')) {
      timerRef.current = setInterval(() => {
        setStatus(getOrderStatus(order));
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [order, status.color]);

  return (
    <div className={`order-card ${status.color}`} style={{ background: getStatusBg(status.color) }}>
      <div className="order-header">
        <div className="left">
          <FaUtensils className="icon" />
          <div>
            <div className="order-id">{order.orderId}</div>
            <div className="order-info">
              {order.type === 'dinein' && (order.table ? `Table-${order.table}` : "Auto Table")}
              <br />
              {new Date(order.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="item-count">{order.totalItems} Item</div>
          </div>
        </div>
        <div className="right">
          <div className="tag">
            <div>{order.type === 'dinein' ? "Dine In" : "Take Away"}</div>
            {status.timeText && <div className="subtext">{status.timeText}</div>}
          </div>
        </div>
      </div>
      <div className="order-body">
        {order.items.length > 0 && (
          <>
            <p>{order.items[0].qty} x {order.items[0].name}</p>
            <ul>
              {order.items.slice(1).map((item, idx) => (
                <li key={idx}>{item.name}</li>
              ))}
            </ul>
          </>
        )}
      </div>
      <div className="order-footer">
        {status.showDropdown ? (
          <select
            onChange={e => {
              if (e.target.value === "pickedup") onPickUp(order._id);
            }}
            defaultValue=""
            className="btn grey"
          >
            <option value="" disabled>Mark as...</option>
            <option value="pickedup">Picked Up</option>
          </select>
        ) : (
          <button className={`btn ${status.color}`}>{status.btnText} {status.icon}</button>
        )}
      </div>
    </div>
  );
};

const OrderLine = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(API_URL);
        setOrders(res.data);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      }
    };
    fetchOrders();
  }, []);

  const handlePickUp = async (id) => {
    try {
      const res = await axios.patch(`${API_URL}/${id}`, { pickedUp: true });
      setOrders(orders => orders.map(o => o._id === id ? res.data : o));
    } catch (err) {
      console.error('Failed to update order:', err);
    }
  };

  return (
    <div className="order-line-page">
      <h2>Order Line</h2>
      <div className="order-grid">
        {orders.map((order) => (
          <OrderCard key={order._id} order={order} onPickUp={handlePickUp} />
        ))}
      </div>
    </div>
  );
};

export default OrderLine;