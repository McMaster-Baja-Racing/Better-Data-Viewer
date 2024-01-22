//CreateGraphModal.js
import ReactDom from "react-dom";
import '../../../styles/modalStyles.css';
import { useRef } from 'react';
import { VideoSelect } from "./videoSelect";
import { useEffect, useState } from 'react';

export const VideoModal = ({ setModal, setSuccessMessage, chartInformation }) => {

  const [selectedSeries, setSelectedSeries] = useState('');
  const [selectedVideo, setSelectedVideo] = useState('');
  const [displayPage, setDisplayPage] = useState(0);

  const modalRef = useRef();
  const closeModal = (e) => {
    if (e.target === modalRef.current) {
      setModal('');
    }
  };

  //Stuff for handling final submit
  const handleSubmit = () => {
  }

  // // This method will return headers when supplied with a list of files. Added support for folders is neccesary
  // const getHeaders = async (files) => {
  //   var col = [];

  //   files.forEach(file => {
  //     file.fileHeaders.forEach(header => {
  //       col.push({
  //         "header": header.trim(),
  //         "filename": file.key
  //       })
  //     })
  //   })

  //   setColumns(col);
  // }
  
  // This method will update the displayPage state by the given amount
  const movePage = (amount) => { 
    setDisplayPage(displayPage + amount);
  }

  useEffect(() => {
    if (displayPage === pages.length) {
      handleSubmit()
      setModal('')
    }
  }, [displayPage])

  const pages = [
    <VideoSelect movePage={movePage} chartInformation={chartInformation} selectedSeries={selectedSeries} setSelectedSeries={setSelectedSeries} selectedVideo={selectedVideo} setSelectedVideo={setSelectedVideo} />,
  ]

  //render the modal JSX in the portal div.
  return ReactDom.createPortal(
    <div className="container" ref={modalRef} onClick={closeModal} >
      <div className="modal">
        {pages[displayPage]}
        <button className="closeButton" onClick={() => setModal('')}>X</button>
      </div>
    </div>,
    document.getElementById("portal")
  );
};