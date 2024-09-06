import './App.css';
import { CreateGraphModal } from './modal/create/CreateGraphModal/CreateGraphModal';
import { UploadModal } from './modal/upload/uploadModal';
import { HelpModal } from './modal/help/helpModal';
import { DownloadModal } from './modal/download/downloadModal';
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Topbar from './Topbar/Topbar';
import Views from './views/Views/Views';
import $ from 'jquery';
import { MAX_VIEWS } from './views/viewsConfig';
import Chart from './views/Chart/Chart';
import MapChart from './map/MapChart/MapChart';

const App = () => {

  // State for holding which modal should be open
  const [modal, setModal] = useState('');
  const [numViews, setNumViews] = useState(1);
  const [videoTimestamp, setVideoTimestamp] = useState(0);
  const [video, setVideo] = useState({ key: '', start: '', end: '' });

  // sample format for chartInformation: 
  // {
  //    files:
  //    [
  //      {
  //        columns: [
  //          {header:"Timestampt", filename:"PRIM_RPM.csv", 
  //              timespan: {start: "18-00-23F--0:00:00", end: "18-00-23F--0:00:00"}},
  //          {header:"RPM", filename:"PRIM_RPM.csv",
  //              timespan: {start: "18-00-23F--0:00:00", end: "18-00-23F--0:00:00"},
  //        ],
  //        analysis: "none"
  //      },
  //      {
  //        columns: [
  //          {header:"RPM", filename:"SEC_RPM.csv", 
  //            timespan: {start: "18-00-23F--0:00:00", end: "18-00-23F--0:00:00"}},
  //          {header:"Timestampt", filename:"SEC_RPM.csv", 
  //            timespan: {start: "18-00-23F--0:00:00", end: "18-00-23F--0:00:00"}}
  //        ],
  //        analysis: "rollAvg"
  //      }
  //   ],
  //   live: false,
  //   type: "line"
  // }

  // State for holding the information for each view
  const [viewInformation, setViewInformation] = useState(
    Array.from({ length: MAX_VIEWS }, () => ({
      component: Chart,
      props: {}
    }))
  );

  // This is an object so that other updates to it will always call the useEffect, even if the message is the same
  const [successMessage, setSuccessMessage] = useState({});
  const [buttonID, setButtonID] = useState(null);

  // Catches when success message is updated and displays it after removing old one
  useEffect(() => {
    if (successMessage === '' || Object.keys(successMessage).length === 0) return;
    // This could use some work to show that they are different messages more clearly
    $('div.success').hide().stop(true, false); 
    $('div.success').slideDown(500).delay(2000).slideUp(1000);
  }, [successMessage]);

  return (
    <BrowserRouter>
      <div className="App">
        <Topbar setModal={setModal} numViews={numViews} setNumViews={setNumViews} />
        <header className="App-body">
          <div className="success">{successMessage.message}</div>
          {modal === 'Create' ? <CreateGraphModal 
            setModal={setModal} 
            setViewInformation={setViewInformation} 
            setSuccessMessage={setSuccessMessage} 
            viewInformation={viewInformation} 
            buttonID={buttonID} 
            setNumViews={setNumViews} 
            numViews={numViews} 
            video={video} 
            setVideo={setVideo}
          /> : null}
          {modal === 'Upload' ? <UploadModal 
            setModal={setModal} 
            setSuccessMessage={setSuccessMessage} 
          /> : null}
          {modal === 'Download' ? <DownloadModal setModal={setModal} /> : null}
          {modal === 'Help' ? <HelpModal setModal={setModal} /> : null}
          <Routes>
            <Route path="*" element={<Views 
              viewInformation={viewInformation} 
              setModal={setModal} 
              setButtonID={setButtonID} 
              numViews={numViews} 
              videoTimestamp={videoTimestamp} 
              setVideoTimestamp={setVideoTimestamp} 
              video={video} 
            />} />
            <Route path="/map" element={<MapChart />} />
          </Routes>
        </header>
      </div>
    </BrowserRouter>
  );

};

export default App;