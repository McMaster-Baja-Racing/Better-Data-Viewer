import React, { useState } from 'react';
import "../styles/help.css";

const Help = ({ popupText, popupImg }) => {
  const [showPopup, setShowPopup] = useState(false);

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  return (
    <div className="popup-container">
      <span className="popup-button" onClick={togglePopup}>Help..?</span>
      {showPopup && (
        <div className="popuptext">
        {popupText}
        {popupImg && <div className="popupimg">{popupImg}</div>}
      </div>
      )}
    </div>
  );
}

export default Help;