//Modal.js
import { useRef } from "react";
import ReactDom from "react-dom";
import '../styles/modalStyles.css';
import { useState, useEffect } from 'react';

export const Modal = ({ setShowModal, fileTransfer }) => {

  // Handles how many axes are selected
  const [dimensions/*, setDimensions*/] = useState(2);

  // Generates the columns for the dropdowns
  const columnGenerator = (n) => {
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

  // Handles the submit button and passes the selected data to the parent component
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
    fileTransfer({
      "columns": selectColumns,
      "live": document.getElementById("liveDataCheckbox").checked,
      "analysis": "none" //TODO: add analysis
    })
    setShowModal(false);
  }

  // close the modal when clicking outside the modal.
  const modalRef = useRef();
  const closeModal = (e) => {
    if (e.target === modalRef.current) {
      setShowModal(false);
    }
  };

  // Handles fetching all files from the server
  const [files, setFiles] = useState([])
  const listFiles = () => {
    //If live data is checked, only show the default live data files
    if (document.getElementById("liveDataCheckbox").checked) {
      setFiles(["F_GPS_SPEED.csv", "F_RPM_PRIM.csv", "F_RPM_SEC.csv", "F_THROTTLE.csv", "F_VEHICLE_SPEED.csv"]);
      return;
    }

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

  
  // Handles the display of the pages, TODO: Consolidate into one function and a parameter
  const showPage1 = () => {
    var x = document.getElementById("one");
    var y = document.getElementById("two");
    var z = document.getElementById("three");
    x.style.display = "block";
    y.style.display = "none";
    z.style.display = "none";
  }
  const showPage2 = () => {
    var x = document.getElementById("one");
    var y = document.getElementById("two");
    var z = document.getElementById("three");
    x.style.display = "none";
    y.style.display = "block";
    z.style.display = "none";
  }
  const showPage3 = () => {
    var x = document.getElementById("one");
    var y = document.getElementById("two");
    var z = document.getElementById("three");
    x.style.display = "none";
    y.style.display = "none";
    z.style.display = "block";
  }

  // Method for checking which files are selected
  const [selectedFiles, setSelectedFiles] = useState([]);
  const getSelectedFiles = async () => {
    var temp = [];

    files.forEach(file => {
      if (document.getElementById("Check_" + file).checked) {
        temp.push(file);
      }
    })

    setSelectedFiles(temp);
  }

  // Handles fetching of headers based on selected files, once the files are selected
  const [columns, setColumns] = useState([]);
  useEffect(() => {
    const getHeaders = async () => {
      //Columns should have an additional attribute for the file name
      var col = [];

      //wrap logic in promise
      await new Promise((resolve, reject) => {
        //catch errors
        var c = 0;
        for (const file of selectedFiles) {
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
                if (c === selectedFiles.length) {
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
    getHeaders();
  }, [selectedFiles]);

  const pageOne = () => (
    <div>
      <input type="checkbox" id="liveDataCheckbox" name="liveData" value="true"></input>
      <label htmlFor="liveData"> would you like Live Data</label><br></br>
      <select>
        <option value="XYGraph">X-Y Graph</option>
        <option value="AccelCurve">AccelCurve</option>
        <option value="Gauge">1D Gauge</option>
      </select>
      <button onClick={() => { showPage2(); listFiles() }} >Next</button>
    </div>
  )
  const pageTwo = () => (
    <div>
      {files.map((file) => {
        return (
          <div key={file}>
            <input type="checkbox" id={"Check_" + file} name={file} value={file}></input>
            <label htmlFor="{file}"> {file}</label><br></br>
          </div>
        )
      })}
      <button onClick={showPage1}>Back</button>
      <button onClick={() => { showPage3(); getSelectedFiles() }} >Next</button>

    </div>
  )
  const pageThree = () => (
    <div>
      <p>Select Axis</p>
      <div>
        {columnGenerator(dimensions)}
      </div>

      <button onClick={showPage2}>Back</button>
      <button onClick={handleSubmit}>Submit</button>
    </div>
  )

  //render the modal JSX in the portal div.

  return ReactDom.createPortal(
    <div className="container" ref={modalRef} onClick={closeModal}>
      <div className="modal">
        <div id="one" >{pageOne()} </div>
        <div id="two" hidden >{pageTwo()}</div>
        <div id="three" hidden> {pageThree()}</div>
        <button className="closeButton" onClick={() => setShowModal(false)}>X</button>
      </div>
    </div>,
    document.getElementById("portal")
  );
};
