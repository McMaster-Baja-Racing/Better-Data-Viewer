//Modal.js
import { useRef } from "react";
import ReactDom from "react-dom";
import '../styles/styles.css';
import { useState } from 'react';
import Papa from "papaparse";

export const Modal = ({ setShowModal, func }) => {

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

  const [columns, setColumns] = useState([]);

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
      complete: function (results) {
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
    func([uploadedFiles, dimensions, selectColumns]);
    setShowModal(false);
  }

  // close the modal when clicking outside the modal.
  const modalRef = useRef();

  const options = [
    { value: '1', label: 'one' },
    { value: '2', label: 'two' },
    { value: '3', label: 'three' }
  ];
  const closeModal = (e) => {
    if (e.target === modalRef.current) {
      setShowModal(false);
    }
  };
  //render the modal JSX in the portal div.
  return ReactDom.createPortal(
    <div className="container" ref={modalRef} onClick={closeModal}>
      <div className="modal">
        <div classname="small">
          <input
            type="file"
            name="file"
            accept=".csv"
            onChange={handleFileEvent}
            style={{ display: "block", margin: "10px auto" }}
          />
          
          {uploadedFiles.map((file, i) => (
            <div key={file.name}>
              {file.name}
            </div>
          ))}
          <label for="Dimensions">Choose a Dimension:</label>
          <select className="dimensions" onChange={handleSelect}>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
          {dimensional(dimensions)}
          
        </div>
        <button onClick={handleSubmit}>Submit!</button>
        <button className="closeButton" onClick={() => setShowModal(false)}>X</button>
      </div>
    </div>,
    document.getElementById("portal")
  );
};
