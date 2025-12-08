import React from "react";
import "./ContactCard.css";

export default function ContactCard({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="contact-overlay" onClick={onClose}>
      <div className="contact-card" onClick={(e) => e.stopPropagation()}>
        <h3>Contact Information</h3>
        <p><strong>Phone:</strong> +358 44 317 0803</p> 
        <p><strong>Email:</strong> muilu.markus@gmail.com</p>

        <button className="close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
