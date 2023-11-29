//CreateGraphModal.js
import ReactDom from "react-dom";
import '../../../styles/modalStyles.css';
import { useState} from 'react';
import { useRef } from 'react';
import FileStorage from '../FileStorage';
import GraphSettings from './GraphSettings';
import AnalyzersAndSeries from './AnalyzersAndSeries';

export const CreateGraphModal = ({ setShowModal, setChartInformation, setSuccessMessage }) => {

  const [dimensions, setDimensions] = useState(2);
  const [columns, setColumns] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
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

  // This method will return headers when supplied with a list of files. Added support for folders is neccesary
  const getHeaders = async (files) => {
    var col = [];

    files.forEach(file => {
      file.fileHeaders.forEach(header => {
        col.push({
          "header": header,
          "filename": file.key
        })
      })
    })

    setColumns(col);
  }
  

  const updatePage = (pageVar) => {
    
    if (displayPage === 2) {
      return (
        <div className='file-Storage-Container'>
          <div className="file-browser">
            <h3>Choose Files</h3>
            <FileStorage selectedFiles={selectedFiles} setSelectedFiles={setSelectedFiles}/>
          </div>
          <div className="fileButtons">
            <button className="pageTwoBackButton" onClick={() => {setDisplayPage(1)}}>Back</button>
            <button className="pageTwoNextButton" onClick={() => {
            // OnClick, it should get the selected files from the file storage component
            if (selectedFiles.length === 0) {
                alert("Please select at least one file.");
                return;
            }
            getHeaders(selectedFiles)
            setDimensions(2)
            setDisplayPage(3);
            }}>Next</button>
          </div>
        </div>
      )
    } else if (displayPage === 3) {
        return (<AnalyzersAndSeries dimensions={dimensions} columns={columns} setDisplayPage={setDisplayPage} setShowModal={setShowModal} handleSubmit={handleSubmit} setSuccessMessage={setSuccessMessage}/>)
    } else{
      return( <GraphSettings setDisplayPage={setDisplayPage} setGraphType={setGraphType} setLiveCheck={setLiveCheck}/>);
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
