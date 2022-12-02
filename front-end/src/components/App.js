import '../styles/App.css';
import '../styles/styles.css';
// import useState
<<<<<<< HEAD

import { Modal } from "./Modal";
import React, { useState } from 'react';
=======
import React, { useState, useEffect } from 'react';
>>>>>>> e26da00415fbdf17a9855fb11c449fdcdce3bfa1
import Chart from './Chart';
import Topbar from './Topbar';


function App() {
<<<<<<< HEAD
  const [showModal, setShowModal] = useState(false);
const openModal = () => {
    setShowModal(true);
=======
  const [data, setData] = useState(null);

  useEffect(() => {
    callBackendAPI()
      .then(res => setData(res.express))
      .catch(err => console.log(err));
  }, []);

  // fetching the GET route from the Express server which matches the GET route from server.js
  const callBackendAPI = async () => {
    const response = await fetch('/express_backend');
    const body = await response.json();

    console.log(body);

    if (response.status !== 200) {
      throw Error(body.message) 
    }
    return body;
>>>>>>> e26da00415fbdf17a9855fb11c449fdcdce3bfa1
  };

  return (
    <><Topbar />
    <div className="App">
    <header className="App-header">
      <button onClick={openModal}>Create Graph</button>
      {showModal ? <Modal setShowModal={setShowModal} /> : null}
      <Chart />
<<<<<<< HEAD
    </header>
      </div>
      </>
=======
      </header>
      <p className="App-intro">{data}</p>
    </div></>
>>>>>>> e26da00415fbdf17a9855fb11c449fdcdce3bfa1
  );
}
export default App;
