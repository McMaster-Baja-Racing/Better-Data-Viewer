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
        <h2>Baja Wiki:<a href=" http://130.113.72.191:6969/" > http://130.113.72.191:6969/ </a></h2>
        
      </div>
    </div>,
    document.getElementById("portal")
  );
};