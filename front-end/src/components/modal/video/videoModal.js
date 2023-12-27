//CreateGraphModal.js
import ReactDom from "react-dom";
import '../../../styles/modalStyles.css';
import { useState } from 'react';
import { useRef } from 'react';
import { VideoUpload } from "./videoUpload";
import { VideoSelect } from "./videoSelect";

export const VideoModal = ({ setModal, setSuccessMessage, chartInformation }) => {

  const [selectedSeries, setSelectedSeries] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState('');
  const [displayPage, setDisplayPage] = useState(1);

  const modalRef = useRef();
  const closeModal = (e) => {
    if (e.target === modalRef.current) {
      setModal('');
    }
  };
  
  // This method will update the displayPage state by the given amount
  const movePage = (amount) => { 
    setDisplayPage(displayPage + amount);
  }

  // This method returns the page that should be displayed based on the displayPage state
  const selectPage = () => {
    switch (displayPage) {
      case 1: return <VideoUpload movePage={movePage} setSuccessMessage={setSuccessMessage} />;
      case 2: return <VideoSelect movePage={movePage} setSuccessMessage={setSuccessMessage} chartInformation={chartInformation} selectedSeries={selectedSeries} setSelectedSeries={setSelectedSeries} selectedVideo={selectedVideo} setSelectedVideo={setSelectedVideo} />;
      default: setModal(''); return null; // close modal if unknown page reached
    }
  }

  //render the modal JSX in the portal div.
  return ReactDom.createPortal(
    <div className="container" ref={modalRef} onClick={closeModal} >
      <div className="modal">
        {selectPage()}
        <button className="closeButton" onClick={() => setModal('')}>X</button>
      </div>
    </div>,
    document.getElementById("portal")
  );
};