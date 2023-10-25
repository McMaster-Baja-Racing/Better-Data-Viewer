import '../styles/App.css';
import { CreateGraphModal } from "./CreateGraphModal";
import { UploadModal } from "./uploadModal";
import { HelpModal } from "./helpModal";
import React, { useState } from 'react';
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

  const success = () => {
    $( "div.success" ).fadeIn("slow")
    $( "div.success" ).fadeOut("slow")
  };
  
  return (
    <div className="App">
      <Topbar openCreateGraphModal={openCreateGraphModal} openUploadModal={openUploadModal} openHelpModal={openHelpModal}/>
      <header className="App-header">
      <div class="success">Sucess message for the stupid</div>
        {showCreateGraphModal ? <CreateGraphModal setShowModal={setShowCreateGraphModal} setChartInformation={setChartInformation} /> : null}
        {showUploadModal ? <UploadModal setShowUploadModal={setShowUploadModal} success={success}/> : null}
        {showHelpModal ? <HelpModal setShowHelpModal={setShowHelpModal} /> : null}

        <Chart chartInformation={chartInformation} />

      </header>

    </div>
  );
}

export default App;