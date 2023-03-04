import '../styles/App.css';
import '../styles/modalStyles.css';
import { Modal } from "./Modal";
import { UploadModal } from "./uploadModal";
import React, { useState } from 'react';
import Chart from './Chart';
import Topbar from './Topbar';
import LiveChart from './LiveChart';

const App = () => {

  // All for create graph popup
  const [showModal, setShowModal] = useState(false);
  const openCreateGraphModal = () => {
    setShowModal(true);
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
  //          {header:"RPM", filename:"PRIM_RPM.csv"}, 
  //          {header:"Timestampt", filename:"PRIM_RPM.csv"}
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
      <Topbar openModal={openCreateGraphModal} openModal1={openUploadModal} />
      <header className="App-header">

        {showModal ? <Modal setShowModal={setShowModal} fileTransfer={handleFileTransfer} /> : null}
        {showUploadModal ? <UploadModal setShowUploadModal={setShowUploadModal} fileTransfer={handleFileTransfer} /> : null}

        {fileInformation.live ? <LiveChart fileInformation={fileInformation}/> : <Chart fileInformation={fileInformation} />}

      </header>

    </div>
  );
}

export default App;
