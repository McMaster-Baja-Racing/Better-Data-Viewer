//CreateGraphModal.js
import ReactDom from "react-dom";
import '../../../styles/modalStyles.css';
import { useState } from 'react';
import { useRef } from 'react';
import FileStorage from '../FileStorage';
import GraphSettings from './GraphSettings';
import AnalyzersAndSeries from './AnalyzersAndSeries';

export const CreateGraphModal = ({ setModal, setChartInformation, setSuccessMessage }) => {

  const [dimensions, setDimensions] = useState(2);
  const [columns, setColumns] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [displayPage, setDisplayPage] = useState(1);
  const [graphType, setGraphType] = useState("");
  const [liveCheck, setLiveCheck] = useState(false);
  const [seriesInfo, setSeriesInfo] = useState([]);

  const modalRef = useRef();
  const closeModal = (e) => {
    if (e.target === modalRef.current) {
      setModal('');
    }
  };

  //Stuff for handling final submit
  const handleSubmit = () => {
    setChartInformation({
      "files": seriesInfo,
      "live": liveCheck,
      "type": graphType
    })
  }

  // This method will return headers when supplied with a list of files. Added support for folders is neccesary
  const getHeaders = async (files) => {
    var col = [];

    files.forEach(file => {
      file.fileHeaders.forEach(header => {
        col.push({
          "header": header.trim(),
          "filename": file.key
        })
      })
    })

    setColumns(col);
  }
  
  // This method will update the displayPage state by the given amount
  const movePage = (amount) => { 
    setDisplayPage(displayPage + amount);
  }

  // This method returns the page that should be displayed based on the displayPage state
  const selectPage = () => {
    switch (displayPage) {
      case 1: return( <GraphSettings movePage={movePage} setGraphType={setGraphType} setLiveCheck={setLiveCheck}/>);
      case 2: return (
        <div className='file-Storage-Container'>
          <div className="file-browser">
            <h3>Choose Files</h3>
            <FileStorage selectedFiles={selectedFiles} setSelectedFiles={setSelectedFiles}/>
          </div>
          <div className="fileButtons">
            <button className="pageTwoBackButton" onClick={() => {movePage(-1)}}>Back</button>
            <button className="pageTwoNextButton" onClick={() => {
            // OnClick, it should get the selected files from the file storage component
            if (selectedFiles.length === 0) {
                alert("Please select at least one file.");
                return;
            }
            getHeaders(selectedFiles)
            setDimensions(2)
            movePage(1);
            }}>Next</button>
          </div>
        </div>
      )
      case 3: return (<AnalyzersAndSeries dimensions={dimensions} columns={columns} movePage={movePage} setModal={setModal} seriesInfo={seriesInfo} setSeriesInfo={setSeriesInfo} handleSubmit={handleSubmit} setSuccessMessage={setSuccessMessage} setDimensions={setDimensions} graphType={graphType}/>)
      default: handleSubmit(); setModal(''); return null;
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
