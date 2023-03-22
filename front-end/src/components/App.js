import '../styles/App.css';
import '../styles/modalStyles.css';
import { CreateGraphModal } from "./CreateGraphModal";
import { UploadModal } from "./uploadModal";
import React, { useState } from 'react';
import Chart from './Chart';
import Topbar from './Topbar';

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
  const [fileInformation, setFileInformation] = useState({files: [], live: false});
  const handleFileTransfer = (e) => {
    console.log(e)
    setFileInformation(e);
  }

  return (
    <div className="App">
      <Topbar openCreateGraphModal={openCreateGraphModal} openUploadModal={openUploadModal} />
      <header className="App-header">

        {showCreateGraphModal ? <CreateGraphModal setShowModal={setShowCreateGraphModal} fileTransfer={handleFileTransfer} /> : null}
        {showUploadModal ? <UploadModal setShowUploadModal={setShowUploadModal} fileTransfer={handleFileTransfer} /> : null}

        <Chart fileInformation={fileInformation} />

      </header>

    </div>
  );
}

export default App;