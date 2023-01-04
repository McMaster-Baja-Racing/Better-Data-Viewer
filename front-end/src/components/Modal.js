//Modal.js
import { useRef } from "react";
import ReactDom from "react-dom";
import '../styles/styles.css';
import { useState, useEffect } from 'react';
import Papa from "papaparse";

export const Modal = ({ setShowModal, fileTransfer }) => {

  const [dimensions, setDimensions] = useState(1);

  const handleSelect = (e) => {
    setDimensions(e.target.value);
  };

  const dimensional = (n) => {
    let arr = [];
    for (let i = 0; i < n; i++) {
      arr.push(<select className={i}>
        {columns.map(column => (
          <option value={column}>{column}</option>
        ))}
      </select>);
    }
    return arr;
  }

  

  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleFileEvent = (e) => {
    console.log(e.target.files[0]);
    const chosenFiles = Array.prototype.slice.call(e.target.files)
    var uploaded = uploadedFiles;
    chosenFiles.some((file) => {
      uploaded.push(file);
    })
    setUploadedFiles(uploaded);
    // Read the first row, split along commas, and use the resulting array as the column names
    Papa.parse(e.target.files[0], {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        var col = columns;
        for (var i = 0; i < Object.keys(results.data[0]).length; i++) {
          col.push(Object.keys(results.data[0])[i]);
        }
        setColumns(col);
      }
    });
  }

  const handleSubmit = (e) => {
    var selectColumns = [];
    for (let i = 0; i < dimensions; i++) {
      selectColumns.push(document.getElementsByClassName(i)[0].value);
    }
    fileTransfer([uploadedFiles, dimensions, selectColumns]);
    setShowModal(false);
  }

  // close the modal when clicking outside the modal.
  const modalRef = useRef();
  
  const closeModal = (e) => {
    if (e.target === modalRef.current) {
      setShowModal(false);
    }
  };

  const onSubmitt = async (data) => {

    const res = await fetch("http://localhost:8080/files/F_GPS_SPEED.csv", {
      mode: 'no-cors',
      method: "GET"
    }).then((res) => {
      res.json()
      console.log(res)
    });

    alert(JSON.stringify(`${res.message}, status: ${res.status}`));
  };


  const getSingleFile = () => {
    fetch('http://localhost:8080/files/F_GPS_SPEED.csv')
        .then(response => {
          console.log(response)
          // the data is in csv format, print it out
          response.text().then(text => {
            console.log(text)
            //do the data stuff here
          });
        })
  }

  const [files, setFiles] = useState([])

  const listFiles = () => {
    fetch('http://localhost:8080/files')
        .then(response => {
          console.log(response)
          // the data is in csv format, print it out
          response.text().then(text => {
            console.log(text)
            //add each individual file to the files array
            setFiles(text.split(", "))
          });
        })
  }

  const [columns, setColumns] = useState([]);

  const getHeaders = async () => {
    var col = [];

    //wrap logic in promise
    await new Promise((resolve, reject) => {
      var c = 0;
      for (const file of files) {
        const result = fetch(`http://localhost:8080/files/${file}/info`)
          .then(response => {
  
            // the data is in csv format, print it out
            response.text().then(text => {
  
              //append it to columns
              for (var i = 0; i < text.split(",").length; i++) {
                col.push(text.split(",")[i]);
              }

              //logic for the promise, increment each time a thread finishes
              c++;
              if (c == files.length) {
                resolve();
              }
  
            });
          })
      }
    })
    
    setColumns(col);
    
  }


  //render the modal JSX in the portal div.
  return ReactDom.createPortal(
    <div className="container" ref={modalRef} onClick={closeModal}>
      <div className="modal">
        <div className="small">
          {/* <input
            type="file"
            name="file"
            accept=".csv"
            onChange={handleFileEvent}
            style={{ display: "block", margin: "10px auto" }}
          /> */}
          <button onClick={listFiles}>Fetch uploaded files!</button>
          <p>{files}</p>

          <button onClick={getHeaders}>Fetch headers!</button>
          <p>{columns}</p>
          
          {/* {uploadedFiles.map((file, i) => (
            <div key={file.name}>
              {file.name}
            </div>
          ))} */}
          
          <label htmlFor="Dimensions">Choose a Dimension:</label>
          <select className="dimensions" onChange={handleSelect}>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
          <div>
            {dimensional(dimensions)}
          </div>
          
          
        </div>
        <button onClick={handleSubmit}>Submit!</button>
        <button className="closeButton" onClick={() => setShowModal(false)}>X</button>
      </div>
    </div>,
    document.getElementById("portal")
  );
};
