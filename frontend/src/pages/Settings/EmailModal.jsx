import React from 'react';
import './settings.css';

const EmailModal = ({ show, children, onclose }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
       
        <div className="modal-content">
          
          {children}</div>
      </div>
    </div>
  );
};

export default EmailModal;