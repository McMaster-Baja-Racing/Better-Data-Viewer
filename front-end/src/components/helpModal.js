// HelpModal.js
import React, { useRef } from 'react';
import ReactDOM from 'react-dom';

export const HelpModal = ({ setShowHelpModal }) => {
  const modalRef = useRef();

  const closeModal = (e) => {
    if (e.target === modalRef.current) {
      setShowHelpModal(false);
    }
  };

  return ReactDOM.createPortal(
    <div className="container" ref={modalRef} onClick={closeModal}>
      <div className="modal">
        <button className="closeButton" onClick={() => setShowHelpModal(false)}>X</button>
      </div>
    </div>,
    document.getElementById("portal")
  );
};