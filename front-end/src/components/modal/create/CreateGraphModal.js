//CreateGraphModal.js
import ReactDom from "react-dom";
import '../../../styles/modalStyles.css';
import { useEffect, useState } from 'react';
import { useRef } from 'react';
import FileStorage from '../FileStorage';
import GraphSettings from './GraphSettings';
import AnalyzersAndSeries from './AnalyzersAndSeries';
import { VideoSelect } from "./VideoSelect";

export const CreateGraphModal = ({ setModal, setChartInformation, setVideoInformation, setSuccessMessage }) => {

  const [dimensions, setDimensions] = useState(2);
  const [columns, setColumns] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [displayPage, setDisplayPage] = useState(0);
  const [graphType, setGraphType] = useState("line");
  const [liveCheck, setLiveCheck] = useState(false);
  const [seriesInfo, setSeriesInfo] = useState([]);
  const [files, setFiles] = useState([])
  const [videoSyncFiles, setVideoSyncFiles] = useState([])
  const [selectedVideo, setSelectedVideo] = useState({ fileHeaders: [], key: "", size: 0 })
  const [videoTimespans, setvideoTimespans] = useState([])
  const [fileTimespans, setfileTimespans] = useState([])

  useEffect(() => {
      // Fetch data when the component mounts
      fetch(`http://${window.location.hostname}:8080/files/folder/csv`)
        .then((response) => response.json())
        .then((data) => {
          setFiles(data);
        });
      fetch(`http://${window.location.hostname}:8080/timespan/folder/mp4`)
        .then((response) => response.json())
        .then((data) => {
          setvideoTimespans(data);
        });
    fetch(`http://${window.location.hostname}:8080/timespan/folder/csv`)
        .then((response) => response.json())
        .then((data) => {
          setfileTimespans(data);
        });
    }, []); // Empty dependency array ensures that the fetch is only performed once

  const modalRef = useRef();
  const closeModal = (e) => {
    if (e.target === modalRef.current) {
      setModal('');
    }
  };

  //Stuff for handling final submit
  const handleSubmit = () => {
    const chartInformation = {
      "files": seriesInfo,
      "live": liveCheck,
      "type": graphType,
    };
  
    if (graphType == "video") {
      // const window = window.open(`http://localhost:3000/video?chartInformation=${encodeURIComponent(JSON.stringify(chartInformation))}`, 'Popup', 'width=1000,height=1000');
      setVideoInformation({ 
        video: selectedVideo, 
        window: window.open(`http://localhost:3000/video/${selectedVideo.key}`, 'Popup', 'width=1000,height=1000') 
      });
    }
  
    setChartInformation(chartInformation);
  };
  

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

  useEffect(() => {
    if (displayPage === pages.length) {
      handleSubmit()
      setModal('')
    }
  }, [displayPage])

  const pages = [
    <GraphSettings movePage={movePage} graphType={graphType} setGraphType={setGraphType} liveCheck={liveCheck} setLiveCheck={setLiveCheck}/>,
    <VideoSelect movePage={movePage} selectedVideo={selectedVideo} setSelectedVideo={setSelectedVideo} files={files} videoSyncFiles={videoSyncFiles} setVideoSyncFiles={setVideoSyncFiles} fileTimespans={fileTimespans} videoTimespans={videoTimespans}/>,
    <div className='file-Storage-Container'>
      <div className="file-browser">
        <h3>Choose Files</h3>
        <FileStorage files={graphType == 'video' ? videoSyncFiles : files} selectedFiles={selectedFiles} setSelectedFiles={setSelectedFiles}/>
      </div>
      <div className="fileButtons">
        <button className="pageTwoBackButton" onClick={() => {movePage(graphType == "video" ? -1 : -2)}}>Back</button>
        <button className="pageTwoNextButton" onClick={() => {
        // OnClick, it should get the selected files from the file storage component
        if (selectedFiles.length === 0) {
          alert("Please select at least one file.");
        } else {
          getHeaders(selectedFiles)
          setDimensions(2)
          movePage(1);
        }
        }}>Next</button>
      </div>
    </div>,

    <AnalyzersAndSeries dimensions={dimensions} columns={columns} movePage={movePage} seriesInfo={seriesInfo} setSeriesInfo={setSeriesInfo} setSuccessMessage={setSuccessMessage} setDimensions={setDimensions} graphType={graphType} fileTimespans={fileTimespans}/>
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
