import React, { useState } from 'react';
import "../styles/help.css";

const Help = ({ data, popupText, popupImg, popupLinks }) => {
  const [showPopup, setShowPopup] = useState(false);

  const {title, description, image, links} = data;

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  return (
    <div className="popup-container">
      <span className="popup-button" onClick={togglePopup}>Help..?</span>
      {showPopup && (
        <div className="popuptext">
          <h1>
            {title}
          </h1>
          <p>
            {description}
          </p>
        {image && <img src={image.link} alt={image.alt}/>}
        {popupLinks}

        {links && links.map((link) => {
          console.log(link)
          return (
              <a href={link.link} target="_blank" rel="noreferrer">{link.title}</a>
          )})}
      </div>
      

      )}
    </div>
  );
}

export default Help;