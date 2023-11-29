//CreateGraphModal.js
import ReactDom from "react-dom";
import '../styles/modalStyles.css';
import { useState } from 'react';
import { useRef } from 'react';
import FileStorage from './FileStorage';
import GraphSettings from './GraphSettings';
import AnalyzersAndSeries from './AnalyzersAndSeries';

export const CreateGraphModal = ({ setShowModal, setChartInformation, setSuccessMessage }) => {

  const [dimensions, setDimensions] = useState(2);
  const [columns, setColumns] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [files, setFiles] = useState([])
  const [displayPage, setDisplayPage] = useState(1);
  const [graphType, setGraphType] = useState("");
  const [liveCheck, setLiveCheck] = useState(false);
  //const [seriesInfo, setSeriesInfo] = useState([]);

  const modalRef = useRef();
  const closeModal = (e) => {
    if (e.target === modalRef.current) {
      setShowModal(false);
    }
  };

  //Stuff for handling final submit
  const handleSubmit = (seriesInfo) => {
    setChartInformation({
      "files": seriesInfo,
      "live": liveCheck,
      "type": graphType
    })
  }


  const updatePage = () => {

    if (displayPage === 2) {
      return (<FileStorage files={files} selectedFiles={selectedFiles} setSelectedFiles={setSelectedFiles} setColumns={setColumns} setDisplayPage={setDisplayPage}/>)
    } else if (displayPage === 3) {
        return (<AnalyzersAndSeries dimensions={dimensions} columns={columns} setDisplayPage={setDisplayPage} setShowModal={setShowModal} handleSubmit={handleSubmit} setSuccessMessage={setSuccessMessage} setDimensions={setDimensions} graphType={graphType}/>)
    } else{
      return( <GraphSettings setDisplayPage={setDisplayPage} setFiles={setFiles} setGraphType={setGraphType} setLiveCheck={setLiveCheck}/>);
    }
  }

  //render the modal JSX in the portal div.
  return ReactDom.createPortal(
    <div className="container" ref={modalRef} onClick={closeModal} >
      <div className="modal">
        {updatePage(displayPage)}
        <button className="closeButton" onClick={() => setShowModal(false)}>X</button>
      </div>
    </div>,
    document.getElementById("portal")
  );
};
