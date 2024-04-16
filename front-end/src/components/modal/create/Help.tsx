import React, { MouseEventHandler } from 'react';
import '../../../styles/help.css';

interface HelpButtonProps {
  onClick: MouseEventHandler
}

const HelpButton: React.FC<HelpButtonProps> = ({ onClick }) => {
  return (
    <span className="popup-button" onClick={onClick}>Help..?</span>
  );
};

interface HelpData {
  title: string;
  description: string;
  image?: { src: string, alt: string };
  links?: { title: string, link: string }[];
}

const HelpPopup: React.FC<HelpData> = ({ title, description, image, links }) => {

  return (
    <div className="popuptext">
      <h1>{title}</h1>
      <p>{description}</p>
      {image && <img src={image.src} alt={image.alt} style={{ width: 250, height: 200 }} />}
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
};

interface HelpProps extends HelpData {
  openPopup: string | null;
  setOpenPopup: React.Dispatch<React.SetStateAction<string | null>>;
}

const Help: React.FC<HelpProps> = ({ title, description, image, links , openPopup, setOpenPopup }) => {

  const togglePopup = () => {
    if (openPopup === title) {
      setOpenPopup(null);
    } else {
      setOpenPopup(title);
    }
  };
  
  return (
    <div>
      <HelpButton onClick={togglePopup} /> {}
      {openPopup === title && <HelpPopup title={title} description={description} image={image} links={links}/>} {}
    </div>
  );
};

export default Help;