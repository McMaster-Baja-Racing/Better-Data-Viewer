//Modal.js
import { useRef } from "react";
import ReactDom from "react-dom";
import '../styles/modalStyles.css';
import { useState } from 'react';

export const Modal = ({ setShowModal, fileTransfer }) => {

  const [dimensions, setDimensions] = useState(2);

  const handleSelect = (e) => {
    setDimensions(e.target.value);
  };

  const dimensional = (n) => {
    let arr = [];
    for (let i = 0; i < n; i++) {
      arr.push(<select className={i} key={i}>
        {columns.map(column => (
          <option value={JSON.stringify(column)} key={column.header + column.filename}>{column.filename} - {column.header}</option>
        ))}
      </select>);
    }
    return arr;
  }

  const handleSubmit = (e) => {
    //Check if they are empty
    if (document.getElementsByClassName(0)[0].value === "") {
      alert("Please select a column for the x-axis.");
      return;
    }
    var selectColumns = [];
    for (let i = 0; i < dimensions; i++) {
      selectColumns.push(JSON.parse(document.getElementsByClassName(i)[0].value));
    }
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
    fetch(`http://${window.location.hostname}:8080/files`)
        .then(response => {
          console.log(response)
          // the data is in csv format, print it out
          response.text().then(text => {
            //Catch empty response
            if (text === "") {
              setFiles([])
              return;
            }
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
      //catch errors
      var c = 0;
      for (const file of files) {
        fetch(`http://${window.location.hostname}:8080/files/${file}/info`)
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
              if (c === files.length) {
                resolve();
              }
  
            });
          }).catch(e => {
            alert(e)
          })
      }
    })
    
    setColumns(col);
    
  }
  const pageOne = () => (
    <div>
      <input type="checkbox" id="liveData" name="liveData" value="yes"></input>
      <label for="liveData"> would you like Live Data</label><br></br>
      <select>
        <option value="actual value 1">X Y Graph</option>
        <option value="actual value 2">Temp</option>
        <option value="actual value 3">Temp</option>
      </select>
      <button onClick={() =>{visibilityfunction2();listFiles()}} >Next</button>
    </div>
    )
  const pageTwo = () => (
    <div>
          <p>{files}</p>
          <button onClick={() =>{visibilityfunction3();getHeaders()}} >Next</button>
        <button onClick={visibilityfunction}>Back</button>
    </div>
  )
  const pageThree = () => (
    <div>
      <button >Fetch headers!</button>
          {columns.map((column, index) => {
            return (
              <div key={column.filename + column.header}>
                {column.header} - {column.filename}
              </div>
            )
          })}
          
          <label htmlFor="Dimensions">Choose a Dimension:</label>
          <select className="dimensions" defaultValue={2} onChange={handleSelect}>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
          <div>
            {dimensional(dimensions)}
          </div>
        <button onClick={visibilityfunction2}>Back</button>
    </div>
  )
  const visibilityfunction = () => {
    var x = document.getElementById("one");
    var y = document.getElementById("two");
    var z = document.getElementById("three");
    x.style.display = "block";
    y.style.display = "none";
    z.style.display = "none";
  }
  const visibilityfunction2 = () => {
    var x = document.getElementById("one");
    var y = document.getElementById("two");
    var z = document.getElementById("three");
    x.style.display = "none";
    y.style.display = "block";
    z.style.display = "none";
  }
  const visibilityfunction3 = () => {
    var x = document.getElementById("one");
    var y = document.getElementById("two");
    var z = document.getElementById("three");
    x.style.display = "none";
    y.style.display = "none";
    z.style.display = "block";
  }
  //render the modal JSX in the portal div.
  return ReactDom.createPortal(
    <div className="container" ref={modalRef} onClick={closeModal}>
      <div className="modal">
        <div id = "one" >{pageOne()} </div>
        <div id = "two" hidden >{pageTwo()}</div>
        <div id = "three" hidden> {pageThree()}</div>
        <button onClick={handleSubmit}>Submit</button>
        <button className="closeButton" onClick={() => setShowModal(false)}>X</button>
      </div>
    </div>,
    document.getElementById("portal")
  );
};
