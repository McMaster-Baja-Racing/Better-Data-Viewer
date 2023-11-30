// HelpModal.js
import React, { useRef } from 'react';
import ReactDOM from 'react-dom';

export const HelpModal = ({ setModal }) => {
  const modalRef = useRef();

  const closeModal = (e) => {
    if (e.target === modalRef.current) {
      setModal('');
    }
  };

  return ReactDOM.createPortal(
    <div className="container" ref={modalRef} onClick={closeModal}>
      <div className="modal">
        <button className="closeButton" onClick={() => setModal('')}>X</button>
        <div className="video-container">
          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
            title="Help????"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>,
    document.getElementById("portal")
  );
};