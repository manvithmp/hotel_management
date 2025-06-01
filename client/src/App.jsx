import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './pages/Dashboard';
import Tables from './pages/Tables';
import Menu from './pages/Menu';
import OrderLine from './pages/OrderLine';
import OrderPage from './pages/OrderPage';

function App() {
  const location = useLocation();
  const isOrderPage = location.pathname === '/order_page';

  return (
    <div className="app-container">
      {!isOrderPage && <Sidebar />}
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tables" element={<Tables />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/order-line" element={<OrderLine />} />
          <Route path="/order_page" element={<OrderPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;