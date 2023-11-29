import React from 'react';
import "../styles/help.css";

const HelpButton = ({ onClick }) => {
  return (
    <span className="popup-button" onClick={onClick}>Help..?</span>
  );
}

const HelpPopup = ({ data }) => {
  const { title, description, image, links } = data;

  return (
    <div className="popuptext">
      <h1>{title}</h1>
      <p>{description}</p>
      {image && <img src={image.link} alt={image.alt} style={{ width: 250, height: 200 }} />}
      <div></div>
      {links && (
        <div>
          {links.map((link, index) => (
            <React.Fragment key={link.link}>
              <a href={link.link} target="_blank" rel="noreferrer">{link.title}</a>
              {index < links.length - 1 && ', '}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

const Help = ({ data, openPopup, setOpenPopup }) => {

  const togglePopup = () => {
    if (openPopup === data.title) {
      setOpenPopup(null);
    } else {
      setOpenPopup(data.title);
    }
  };
  
  return (
    <div>
      <HelpButton onClick={togglePopup} /> {}
      {openPopup === data.title && <HelpPopup data={data} />} {}
    </div>
  );
};

export default Help;