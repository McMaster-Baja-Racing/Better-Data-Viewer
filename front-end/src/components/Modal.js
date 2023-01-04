//Modal.js
import { useRef } from "react";
import ReactDom from "react-dom";
import '../styles/modalStyles.css';
import { useState, useEffect } from 'react';

export const Modal = ({ setShowModal, fileTransfer }) => {

  const [dimensions, setDimensions] = useState(2);

  const handleSelect = (e) => {
    setDimensions(e.target.value);
  };

  const dimensional = (n) => {
    let arr = [];
    for (let i = 0; i < n; i++) {
      arr.push(<select className={i}>
        {columns.map(column => (
          <option value={column.filename}>{column.filename} - {column.header}</option>
        ))}
      </select>);
    }
    return arr;
  }

  const handleSubmit = (e) => {
    var selectColumns = [];
    for (let i = 0; i < dimensions; i++) {
      selectColumns.push(document.getElementsByClassName(i)[0].value);
      console.log("HAHA")
      console.log(document.getElementsByClassName(i)[0].value)
    }
    console.log(selectColumns)
    fileTransfer(selectColumns);
    setShowModal(false);
  }

  // close the modal when clicking outside the modal.
  const modalRef = useRef();
  
  const closeModal = (e) => {
    if (e.target === modalRef.current) {
      setShowModal(false);
    }
  };

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
    //Columns should have an additional attribute for the file name
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
                col.push({
                  "header": text.split(",")[i],
                  "filename": file
                });
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
          <button onClick={listFiles}>Fetch uploaded files!</button>
          <p>{files}</p>

          <button onClick={getHeaders}>Fetch headers!</button>
          {columns.map((column, index) => {
            return (
              <div key={index}>
                {column.header} - {column.filename}
              </div>
            )
          })}
          
          <label htmlFor="Dimensions">Choose a Dimension:</label>
          <select className="dimensions" onChange={handleSelect}>
            <option value="1">1</option>
            <option value="2" selected="selected">2</option>
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
