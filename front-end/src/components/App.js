import '../styles/App.css';
import '../styles/styles.css';
// import useState

import { Modal } from "./Modal";
import React, { useState } from 'react';
import Chart from './Chart';
import Topbar from './Topbar';


function App() {
  const [showModal, setShowModal] = useState(false);
const openModal = () => {
    setShowModal(true);
  };

  return (
    <><Topbar />
    <div className="App">
    <header className="App-header">
      <button onClick={openModal}>Create Graph</button>
      {showModal ? <Modal setShowModal={setShowModal} /> : null}
      <Chart />
    </header>
      </div>
      </>
  );
}
export default App;
