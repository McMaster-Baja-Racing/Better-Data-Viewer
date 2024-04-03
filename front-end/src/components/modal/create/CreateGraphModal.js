//CreateGraphModal.js
import ReactDom from 'react-dom';
import '../../../styles/modalStyles.css';
import React, { useEffect, useState, useCallback } from 'react';
import { useRef } from 'react';
import FileStorage from '../FileStorage';
import GraphSettings from './GraphSettings';
import AnalyzersAndSeries from './AnalyzersAndSeries';
import { VideoSelect } from './VideoSelect';
import { MAX_VIEWS } from '../../views/viewsConfig';
import Chart from '../../views/Chart';
import VideoPlayer from '../../views/VideoPlayer';
import { replaceViewAtIndex } from '../../../lib/viewUtils';
import { filterFiles } from '../../../lib/videoUtils';
import { ApiUtil } from '../../../lib/apiUtils';

export const CreateGraphModal = ({
  setModal,
  setViewInformation,
  setSuccessMessage,
  viewInformation,
  buttonID,
  setNumViews,
  numViews,
  video,
  setVideo
}) => {

  const [dimensions, setDimensions] = useState(2);
  const [columns, setColumns] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [displayPage, setDisplayPage] = useState(0);
  const [graphType, setGraphType] = useState('line');
  const [liveCheck, setLiveCheck] = useState(false);
  const [seriesInfo, setSeriesInfo] = useState([]);
  const [files, setFiles] = useState([]);
  const [videoTimespans, setvideoTimespans] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState({ key: '', start: '', end: '' });
  const [fileTimespans, setfileTimespans] = useState([]);


  useEffect(() => {
    // Fetch data when the component mounts
    ApiUtil.getFolder('csv')
      .then((response) => response.json())
      .then((data) => {
        setFiles(data);
      });
    ApiUtil.getTimespans('mp4')
      .then((response) => response.json())
      .then((data) => {
        setvideoTimespans(data);
      });
    ApiUtil.getTimespans('csv')
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
  const handleSubmit = useCallback(() => {
    const chartInformation = {
      files: (buttonID === MAX_VIEWS) ? selectedFiles : seriesInfo,
      live: liveCheck,
      type: graphType,
    };
  
    let updatedViewInformation = replaceViewAtIndex(
      viewInformation,
      buttonID,
      { component: Chart, props: { chartInformation } }
    );

    if (selectedVideo.key !== '') setVideo(selectedVideo);

    if (
      buttonID + 1 < MAX_VIEWS &&
      graphType === 'video' &&
      viewInformation.find((view) => view.component.name === 'VideoPlayer') === undefined
    ) {
      updatedViewInformation = replaceViewAtIndex(
        updatedViewInformation,
        buttonID + 1,
        { component: VideoPlayer, props: {} }
      );
      if (buttonID + 1 === numViews) setNumViews(numViews + 1);
    }

    setViewInformation(updatedViewInformation);
  }, [
    buttonID,
    selectedFiles,
    seriesInfo,
    liveCheck,
    graphType,
    viewInformation,
    selectedVideo,
    numViews,
    setVideo,
    setNumViews,
    setViewInformation
  ]);
  

  // This method will return headers when supplied with a list of files. Added support for folders is neccesary
  const getHeaders = async (files) => {
    var col = [];

    files.forEach(file => {
      file.fileHeaders.forEach(header => {
        col.push({
          'header': header.trim(),
          'filename': file.key
        });
      });
    });

    setColumns(col);
  };
  
  // This method will update the displayPage state by the given amount
  const movePage = (amount) => { 
    setDisplayPage(displayPage + amount);
  };

  useEffect(() => {
    if (displayPage === 4) {
      handleSubmit();
      setModal('');
    }
  }, [displayPage, 4, setModal, handleSubmit]);

  const pageSelect = (page) => {
    switch (page) {
      case 0:
        return <GraphSettings 
          movePage={movePage} 
          graphType={graphType} 
          setGraphType={setGraphType} 
          liveCheck={liveCheck} 
          setLiveCheck={setLiveCheck} 
          video={video}
        />;
      case 1:
        return <VideoSelect 
          movePage={movePage} 
          selectedVideo={selectedVideo} 
          setSelectedVideo={setSelectedVideo} 
          files={files} fileTimespans={fileTimespans} 
          videoTimespans={videoTimespans}
        />;
      case 2:
        return <div className='file-Storage-Container'>
          <div className="file-browser">
            <h3>Choose Files</h3>
            <FileStorage 
              files={graphType === 'video' 
                ? filterFiles(selectedVideo.key === '' ? video : selectedVideo, files, fileTimespans) 
                : files} 
              selectedFiles={selectedFiles} 
              setSelectedFiles={setSelectedFiles}
            />
          </div>
          <div className="fileButtons">
            <button className="pageTwoBackButton" onClick={() => {
              movePage(graphType === 'video' && selectedVideo.key !== '' ? -1 : -2);
            }}>Back</button>
            <button className="pageTwoNextButton" onClick={() => {
              // OnClick, it should get the selected files from the file storage component
              if (selectedFiles.length === 0) {
                alert('Please select at least one file.');
              } else {
                getHeaders(selectedFiles);
                setDimensions(2);
                movePage(1);
              }
            }}>Next</button>
          </div>
        </div>;
      case 3: 
        return <AnalyzersAndSeries 
          dimensions={dimensions} 
          columns={columns} 
          movePage={movePage} 
          seriesInfo={seriesInfo} 
          setSeriesInfo={setSeriesInfo} 
          setSuccessMessage={setSuccessMessage} 
          setDimensions={setDimensions} 
          graphType={graphType} 
          fileTimespans={fileTimespans}
        />;
      default:
        break;
    }
  };

  //render the modal JSX in the portal div.
  return ReactDom.createPortal(
    <div className="container" ref={modalRef} onClick={closeModal} >
      <div className="modal">
        {pageSelect(displayPage)}
        <button className="closeButton" onClick={() => setModal('')}>X</button>
      </div>
    </div>,
    document.getElementById('portal')
  );
};
