import '../styles/App.css';
import '../styles/modalStyles.css';
import { Modal } from "./Modal";
import { UploadModal } from "./uploadModal";
import React, { useState } from 'react';
import Chart from './Chart';
import Topbar from './Topbar';


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
  const [fileInformation, setFileInformation] = useState([]);

  const handleFileTransfer = (e) => {
    alert(JSON.stringify(window.location))
    alert(window.location.hostname)
    setFileInformation(e);
  }

  return (
    <>
      <div className="App">
      <Topbar openModal={openCreateGraphModal} openModal1={openUploadModal}/>
        <header className="App-header">

          {showModal ? <Modal setShowModal={setShowModal} fileTransfer={handleFileTransfer} /> : null}
          {showUploadModal ? <UploadModal setShowUploadModal={setShowUploadModal} fileTransfer={handleFileTransfer} /> : null}
          
          <Chart fileInformation={fileInformation} />
        </header>

      </div>
    </>
  );
}

export default App;
