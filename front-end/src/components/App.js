import '../styles/App.css';
import '../styles/styles.css';
import { Modal } from "./Modal";
import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import Chart from './Chart';
import Topbar from './Topbar';


function App() {

  // All for popup
  const [showModal, setShowModal] = useState(false);

  const openModal = () => {
    setShowModal(true);
  }

  const [fileInformation, setFileInformation] = useState([]);

  const handleFileTransfer = (e) => {
    console.log(e);
    setFileInformation(e);
  }

  const { register, handleSubmit } = useForm();

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("file", data.file[0]);

    const res = await fetch("http://localhost:8080", {
      mode: 'no-cors',
      method: "POST",
      body: formData,
    }).then((res) => res.json());
    alert(JSON.stringify(`${res.message}, status: ${res.status}`));
  };

  return (
    <><Topbar />
      <div className="App">
        <header className="App-header">

          <button onClick={openModal}>Create Graph</button>
          {showModal ? <Modal setShowModal={setShowModal} func={handleFileTransfer} /> : null}
          <Chart fileInformation={fileInformation} /> <p className="App-intro">AAA</p>
          <button onClick={onSubmit}> Hey ;)</button>

          <form onSubmit={handleSubmit(onSubmit)}>
            <input type="file" {...register("file")} />

            <input type="submit" />
          </form>

        </header>

      </div>
    </>
  );
}

export default App;
