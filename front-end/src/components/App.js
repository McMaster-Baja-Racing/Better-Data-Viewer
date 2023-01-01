import '../styles/App.css';
import '../styles/styles.css';
import { Modal } from "./Modal";
import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import Chart from './Chart';
import Topbar from './Topbar';


function App() {

  // All for popup
  const [showModal, setShowModal] = useState(false);

  const openModal = () => {
    setShowModal(true);
  }

  //This stuff is for api fetching
  const [data, setData] = useState(null);

  // useEffect(() => {
  //   callBackendAPI()
  //     .then(res => setData(res.express))
  //     .catch(err => console.log(err));
  // }, []);

  const [fileInformation, setFileInformation] = useState([]);

  const handleFileTransfer = (e) => {
    console.log(e);
    setFileInformation(e);
  }

  // fetching the GET route from the Express server which matches the GET route from server.js
  const callBackendAPI = async () => {
    const response = await fetch('/express_backend');
    const body = await response.json();

    console.log(body);

    if (response.status !== 200) {
      throw Error(body.message)
    }
    return body;
  };

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
          <Chart fileInformation={fileInformation} /> <p className="App-intro">{data}</p>
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
