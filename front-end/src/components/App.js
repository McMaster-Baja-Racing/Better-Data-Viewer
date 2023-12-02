import '../styles/App.css';
import { CreateGraphModal } from "./CreateGraphModal";
import { UploadModal } from "./uploadModal";
import { HelpModal } from "./helpModal";
import React, { useEffect, useState } from 'react';
import Chart from './Chart';
import Topbar from './Topbar';
import $ from 'jquery';

const App = () => {

  // All for create graph popup
  const [showCreateGraphModal, setShowCreateGraphModal] = useState(false);
  const openCreateGraphModal = () => {
    setShowCreateGraphModal(true);
  }
  // All for upload popup
  const [showUploadModal, setShowUploadModal] = useState(false);
  const openUploadModal = () => {
    setShowUploadModal(true);
  }

  // All for help popup
  const [showHelpModal, setShowHelpModal] = useState(false);
  const openHelpModal = () => {
    setShowHelpModal(true);
  }



  // All for information transfer between children and parent
  // sample format for chartInformation: 
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
      <Topbar openCreateGraphModal={openCreateGraphModal} openUploadModal={openUploadModal} openHelpModal={openHelpModal}/>
      <header className="App-header">
        <div className="success">{successMessage.message}</div>
        {showCreateGraphModal ? <CreateGraphModal setShowModal={setShowCreateGraphModal} setChartInformation={setChartInformation} setSuccessMessage={setSuccessMessage}/> : null}
        {showUploadModal ? <UploadModal setShowUploadModal={setShowUploadModal} setSuccessMessage={setSuccessMessage}/> : null}
        {showHelpModal ? <HelpModal setShowHelpModal={setShowHelpModal} /> : null}

        <Chart chartInformation={chartInformation} />

      </header>

    </div>
  );
}

export default App;