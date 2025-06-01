import React, { useState, useEffect } from 'react';
import './Tables.css';
import { FaTrashAlt } from 'react-icons/fa';
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/tables`;

const Tables = () => {
  const [tables, setTables] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [chairCount, setChairCount] = useState(3);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const res = await axios.get(API_URL);
        setTables(res.data);
      } catch (err) {
        console.error('Failed to fetch tables:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTables();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTables(prev => prev.filter(t => t._id !== id));
    } catch (err) {
      console.error('Failed to delete table:', err);
    }
  };

  const handleCreate = async () => {
    try {
      const nextNumber = tables.length > 0
        ? (Math.max(...tables.map(t => Number(t.number))) + 1).toString()
        : '1';

      const res = await axios.post(API_URL, {
        number: nextNumber,
        name: newTableName,
        chairs: chairCount,
      });
      setTables([...tables, res.data]);
      setNewTableName('');
      setChairCount(3);
      setShowModal(false);
    } catch (err) {
      console.error('Failed to create table:', err);
    }
  };

  if (loading) return <div>Loading tables...</div>;

  return (
    <div className="tables-page">
      <h2>Tables</h2>
      <div className="tables-grid">
        {tables.map((table) => (
          <div key={table._id} className="table-box">
            <div className="table-header">
              <span>{table.name ? table.name : 'Table'}</span>
              <FaTrashAlt className="delete-icon" onClick={() => handleDelete(table._id)} />
            </div>
            <p className="table-number">{String(table.number).padStart(2, '0')}</p>
            <p className="chairs-count">🪑 {String(table.chairs).padStart(2, '0')}</p>
          </div>
        ))}

        <div className="table-box add-table" onClick={() => setShowModal(true)}>
          <span>+</span>
        </div>
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-box">
            <label>Table name (optional)</label>
            <input
              type="text"
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
              placeholder={`Table ${tables.length + 1}`}
            />
            <label>Chair</label>
            <select value={chairCount} onChange={(e) => setChairCount(Number(e.target.value))}>
              {[1, 2, 3, 4, 5, 6].map(n => (
                <option key={n} value={n}>{String(n).padStart(2, '0')}</option>
              ))}
            </select>
            <button onClick={handleCreate}>Create</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tables;