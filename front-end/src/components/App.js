import '../styles/App.css';
import { CreateGraphModal } from "./modal/create/CreateGraphModal";
import { UploadModal } from "./modal/upload/uploadModal";
import { HelpModal } from "./modal/help/helpModal";
import React, { useEffect, useState } from 'react';
import Chart from './Chart';
import Topbar from './Topbar';
import $ from 'jquery';
import { DownloadModal } from './modal/download/downloadModal';

const App = () => {

  const [modal, setModal] = useState('')

  // All for create graph popup
  const [showCreateGraphModal, setShowCreateGraphModal] = useState(false);
  const openCreateGraphModal = () => {
    setModal('Create')
  }
  // All for upload popup
  const [showUploadModal, setShowUploadModal] = useState(false);
  const openUploadModal = () => {
    setModal('Upload')
  }

  // All for download popup
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const openDownloadModal = () => {
    setModal('Download')
  }

  // All for help popup
  const [showHelpModal, setShowHelpModal] = useState(false);
  const openHelpModal = () => {
    setModal('Help')
  }

  // All for information transfer between children and parent
  // sample format for fileInformation: 
  // {
  //    files:
  //    [
  //      {
  //        columns: [
  //          {header:"Timestampt", filename:"PRIM_RPM.csv"},
  //          {header:"RPM", filename:"PRIM_RPM.csv"},
  //        ],
  //        analysis: "none"
  //      },
  //      {
  //        columns: [
  //          {header:"RPM", filename:"SEC_RPM.csv"},
  //          {header:"Timestampt", filename:"SEC_RPM.csv"}
  //        ],
  //        analysis: "rollAvg"
  //      }
  //   ],
  //   live: false,
  //   type: "line"
  // }

  const [chartInformation, setChartInformation] = useState({
    files: [],
    live: false,
    type: "line"
  });

  // This is an object so that other updates to it will always call the useEffect, even if the message is the same
  const [successMessage, setSuccessMessage] = useState({})

  // Catches when success message is updated and displays it after removing old one
  useEffect(() => {
    if (successMessage === "" || Object.keys(successMessage).length === 0) return;
    $( "div.success" ).hide().stop(true, false) // This could use some work to show that they are different messages more clearly
    $( "div.success" ).slideDown(500).delay(2000).slideUp(1000);
  }, [successMessage]);
  
  return (
    <div className="App">
      <Topbar openCreateGraphModal={openCreateGraphModal} openUploadModal={openUploadModal} openDownloadModal={openDownloadModal} openHelpModal={openHelpModal}/>
      <header className="App-header">
        <div className="success">{successMessage.message}</div>
        {modal === 'Create' ? <CreateGraphModal setShowModal={setModal} setChartInformation={setChartInformation} setSuccessMessage={setSuccessMessage}/> : null}
        {modal === 'Upload' ? <UploadModal setShowUploadModal={setModal} setSuccessMessage={setSuccessMessage}/> : null}
        {modal === 'Download' ? <DownloadModal setShowDownloadModal={setModal} setChartInformation={setChartInformation} setSuccessMessage={setSuccessMessage}/> : null}
        {modal === 'Help' ? <HelpModal setShowHelpModal={setModal} /> : null}

        <Chart chartInformation={chartInformation} />

      </header>

    </div>
  );
}

export default App;