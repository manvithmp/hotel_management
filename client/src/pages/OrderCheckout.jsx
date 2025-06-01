import React, { useState } from "react";
import "./OrderCheckout.css";

const CATEGORY_TIMES = {
  pizza: 10,
  burger: 10,
  pasta: 10,
  coffee: 10,
  milkshake: 10,
};

function calcEta(cart, dishes, type) {
  let mins = 0;
  for (const [dishId, qty] of Object.entries(cart)) {
    const found = dishes.find(d => (d._id || d.id) === dishId);
    if (!found) continue;
    const cat = found.category.toLowerCase();
    mins += (CATEGORY_TIMES[cat] || 10) * qty;
  }
  if (type === "takeaway") mins += 15;
  return mins;
}

const API_URL = import.meta.env.VITE_API_URL;

async function placeOrderApi({ type, table, items, totalItems, totalPrice, user, cookingNotes }) {
  const response = await fetch(`${API_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, table, items, totalItems, totalPrice, user, cookingNotes }),
  });
  return response.json();
}

export default function OrderCheckout({
  cart,
  dishes,
  onBack,
  onOrderPlaced,
  handleRemoveFromCart
}) {
  const [showUserModal, setShowUserModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showCookingModal, setShowCookingModal] = useState(false);

  const [type, setType] = useState("dinein");
  const [table, setTable] = useState(""); 
  const [location, setLocation] = useState("");
  const [cookingNotes, setCookingNotes] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [placed, setPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");


  const items = Object.entries(cart)
    .map(([dishId, qty]) => {
      const dish = dishes.find(d => (d._id || d.id) === dishId);
      return dish ? { ...dish, qty } : null;
    })
    .filter(Boolean);

  const itemTotal = items.reduce((sum, dish) => sum + dish.price * dish.qty, 0);
  const deliveryCharge = type === "takeaway" ? 50 : 0;
  const tableCharge = type === "dinein" && table ? 50 : 0;
  const tax = 12;
  const grandTotal = itemTotal + deliveryCharge + tax + tableCharge;
  const eta = calcEta(cart, dishes, type);

  const canPlaceOrder =
    !!name &&
    !!mobile &&
    (type === "dinein" ? true : !!location) &&
    items.length > 0;

  if (placed) {
    return (
      <div className="checkout-main">
        <div className="order-status-box">
          <div className="order-status-title">Thank you for ordering!</div>
          {orderId && (
            <div style={{margin: "0.5em 0 1.1em 0", fontWeight: 600, color: "#b02a37"}}>
              Your Order ID: <span style={{fontWeight: 700}}>{orderId}</span>
            </div>
          )}
          <div className="order-status-time">
            {type === "dinein" ? (
              <>
                Your order will be ready in <b>{eta} mins</b><br />
                {table && <>Table Reserved: <b>{table}</b></>}
              </>
            ) : (
              <>
                Your order will be delivered in <b>{eta} mins</b><br />
                To: <b>{location}</b>
              </>
            )}
          </div>
          <button className="back-btn" onClick={onBack}>Back to Menu</button>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const orderItems = items.map(item => ({
        name: item.name,
        qty: item.qty
      }));
      const payload = {
        type,
        table: type === "dinein" ? table : undefined,
        items: orderItems,
        totalItems: orderItems.reduce((sum, i) => sum + i.qty, 0),
        totalPrice: grandTotal,
        user: {
          name,
          mobile,
          location: type === "takeaway" ? location : undefined
        },
        cookingNotes: cookingNotes || undefined
      };
      const result = await placeOrderApi(payload);
      if (result.success) {
        setOrderId(result.orderId);
        setPlaced(true);
        if (onOrderPlaced) onOrderPlaced(result.orderId);
      } else {
        setErrorMsg(result.error || "Order could not be placed.");
      }
    } catch (err) {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-main">
      <div className="checkout-header">
        <h2>Good evening</h2>
        <p>Place your order here</p>
      </div>

      <div className="checkout-cart-list">
        {items.map(dish => (
          <div key={dish._id || dish.id} className="checkout-cart-card">
            <img src={dish.image} alt={dish.name} className="checkout-cart-img"/>
            <div className="checkout-cart-info">
              <div className="checkout-cart-title">{dish.name}</div>
              <div className="checkout-cart-row">
                <span>₹{dish.price}</span>
                <span style={{margin: "0 8px"}}>×</span>
                <span>{dish.qty}</span>
                <button
                  className="checkout-remove-btn"
                  onClick={() => handleRemoveFromCart(dish._id || dish.id)}
                  aria-label="Remove from cart"
                  style={{
                    marginLeft: '10px',
                    background: 'none',
                    border: 'none',
                    color: '#f01c1c',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >×</button>
              </div>
              <button className="modal-trigger-btn" onClick={() => setShowCookingModal(true)}>
                {cookingNotes ? "Edit Cooking Instructions" : "Add Cooking Instructions"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="dine-take-row">
        <button
          className={`dine-btn${type === "dinein" ? " selected" : ""}`}
          onClick={() => setType("dinein")}
        >Dine In</button>
        <button
          className={`dine-btn${type === "takeaway" ? " selected" : ""}`}
          onClick={() => setType("takeaway")}
        >Take Away</button>
      </div>

      <div className="charges-block">
        <div className="charge-row">
          <span>Item Total</span>
          <span>₹{itemTotal.toFixed(2)}</span>
        </div>
        {type === "takeaway" ? (
          <div className="charge-row">
            <span>Delivery Charge</span>
            <span>₹50</span>
          </div>
        ) : table ? (
          <div className="charge-row">
            <span>Table Reservation</span>
            <span>₹50</span>
          </div>
        ) : null}
        <div className="charge-row">
          <span>Taxes</span>
          <span>₹12</span>
        </div>
        <div className="charge-row grand-total">
          <span>Grand Total</span>
          <span>₹{grandTotal.toFixed(2)}</span>
        </div>
      </div>

      <div className="user-details-section">
        <div className="details-title">Your details</div>
        <button className="modal-trigger-btn" onClick={() => setShowUserModal(true)}>
          {name && mobile ? "Edit User Information" : "Add User Information"}
        </button>
        {type === "dinein" && (
          <button className="modal-trigger-btn" onClick={() => setShowTableModal(true)}>
            {table ? "Edit Table Booking" : "Book a Table (Optional)"}
          </button>
        )}
        {type === "takeaway" && (
          <button className="modal-trigger-btn" onClick={() => setShowLocationModal(true)}>
            {location ? "Edit Delivery Location" : "Add Delivery Location"}
          </button>
        )}
        <div className="details-summary">
          {name && <div><b>Name:</b> {name}</div>}
          {mobile && <div><b>Mobile:</b> {mobile}</div>}
          {type === "dinein" && table && <div><b>Table:</b> {table}</div>}
          {type === "takeaway" && location && <div><b>Location:</b> {location}</div>}
          {cookingNotes && <div className="instruction-summary"><b>Instructions:</b> {cookingNotes}</div>}
        </div>
      </div>

      <div className="eta-block">
        {type === "dinein"
          ? <span>Your order will be ready in <b>{eta} mins</b></span>
          : <span>Your order will be delivered in <b>{eta} mins</b></span>
        }
      </div>

      <div className="swipe-row">
        <button
          className="swipe-btn"
          disabled={!canPlaceOrder || loading}
          onClick={handlePlaceOrder}
        >
          <span className="swipe-arrow">→</span>
          {loading ? "Placing..." : "Place Order"}
        </button>
      </div>
      {errorMsg && (
        <div style={{color: "#c90000", margin: "1em 0 0 0", textAlign: "center"}}>
          {errorMsg}
        </div>
      )}
      <button className="back-btn" onClick={onBack}>Back</button>

      {showUserModal && (
        <Modal onClose={() => setShowUserModal(false)} title="User Information">
          <input
            className="details-input"
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
          />
          <input
            className="details-input"
            placeholder="Mobile Number"
            value={mobile}
            onChange={e => setMobile(e.target.value)}
          />
          <button
            className="modal-save-btn"
            onClick={() => setShowUserModal(false)}
          >Save</button>
        </Modal>
      )}

      {showTableModal && (
        <Modal onClose={() => setShowTableModal(false)} title="Table Booking (Optional)">
          <input
            className="details-input"
            placeholder="Table Number"
            value={table}
            onChange={e => setTable(e.target.value)}
            autoFocus
          />
          <button
            className="modal-save-btn"
            onClick={() => setShowTableModal(false)}
          >Save</button>
        </Modal>
      )}

      {showLocationModal && (
        <Modal onClose={() => setShowLocationModal(false)} title="Delivery Location">
          <input
            className="details-input"
            placeholder="Delivery Location"
            value={location}
            onChange={e => setLocation(e.target.value)}
            autoFocus
          />
          <button
            className="modal-save-btn"
            onClick={() => setShowLocationModal(false)}
          >Save</button>
        </Modal>
      )}

      {showCookingModal && (
        <Modal onClose={() => setShowCookingModal(false)} title="Cooking Instructions">
          <textarea
            className="details-input"
            placeholder="Add cooking instructions (optional)"
            value={cookingNotes}
            onChange={e => setCookingNotes(e.target.value)}
            style={{ minHeight: 60, resize: "vertical" }}
            autoFocus
          />
          <button
            className="modal-save-btn"
            onClick={() => setShowCookingModal(false)}
          >Save</button>
        </Modal>
      )}

    </div>
  );
}

function Modal({ children, onClose, title }) {
  return (
    <div className="modal-overlay">
      <div className="modal-popup">
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}