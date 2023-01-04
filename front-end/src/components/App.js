import '../styles/App.css';
import '../styles/modalStyles.css';
import { Modal } from "./Modal";
import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import Chart from './Chart';
import Topbar from './Topbar';


const App = () => {

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

  //This stuff is for backend API

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
    <>
      <div className="App">
      <Topbar openModal={openModal}/>
        <header className="App-header">

          {showModal ? <Modal setShowModal={setShowModal} fileTransfer={handleFileTransfer} /> : null}
          
          <Chart fileInformation={fileInformation} />

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
