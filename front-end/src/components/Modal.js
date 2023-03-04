//Modal.js
import { useRef } from "react";
import ReactDom from "react-dom";
import '../styles/modalStyles.css';
import { useState, useEffect } from 'react';

export const Modal = ({ setShowModal, fileTransfer }) => {

  // Handles how many axes are selected
  const [dimensions, setDimensions] = useState(2);

  // Generates the columns for the dropdowns
  const columnGenerator = (n) => {
    let arr = [];
    for (let i = 0; i < n; i++) {
      arr.push(
      <div > <div className="boldText">{i === 0 ? "X-Axis" : "Y-Axis"} </div>
        <select className={i} key={i}>
          {columns.map(column => (
            <option value={JSON.stringify(column)} key={column.header + column.filename}>{column.filename} - {column.header}</option>
          ))}
        </select>
      </div>);
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
    if (seriescounter===0){
      fileTransfer({
        "files": [
          {
            "columns": selectColumns,
            "analysis": getAnalysis(),
          }
        ],
        "live": document.getElementById("liveDataCheckbox").checked,
        "type": document.getElementById("graphTypeSelect").value
    })
    }else{
      console.log(fileinfo)
      fileTransfer({
        fileinfo
      })
    }
  
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
    var filesSelected = [];

    files.forEach(file => {
      if (document.getElementById("Check_" + file).checked) {
        filesSelected.push(file);
      }
    })

    setSelectedFiles(filesSelected);
  }

  // Handles fetching of headers based on selected files, once the files are selected
  const [columns, setColumns] = useState([]);
  useEffect(() => {
    const getHeaders = async () => {
      if (document.getElementById("liveDataCheckbox").checked) {
        setColumns([
          {
            "header": "F_GPS_SPEED.csv",
            "filename": "F_GPS_SPEED.csv"
          },
          {
            "header": "F_RPM_PRIM.csv",
            "filename": "F_RPM_PRIM.csv"
          },
          {
            "header": "F_RPM_SEC.csv",
            "filename": "F_RPM_SEC.csv"
          }
        ])
        return;
      }
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

  var fileinfo = [[]]
  var seriescounter = 0;
  
  const addSeries = () => {
    
    if (document.getElementsByClassName(0)[0].value === "") {
      alert("Please select a column for the x-axis.");
      return;
    }
    var selectColumns = [];
    for (let i = 0; i < dimensions; i++) {
      selectColumns.push(JSON.parse(document.getElementsByClassName(i)[0].value));
    }
    fileinfo.push([{
      "columns": selectColumns,
      "live": document.getElementById("liveDataCheckbox").checked,
      "analysis": getAnalysis(),
      "type": document.getElementById("graphTypeSelect").value
    }])
    seriescounter++;
  }

  // Handles the selection of the analysis
  const getAnalysis = () => {
    var analNames = ["linearInterpolate","accelCurve", "rollAvg"];
    var selectedAnals = [];
    for (var i = 0; i < analNames.length; i++) {
      if (document.getElementById(analNames[i]).checked) {
        selectedAnals.push(analNames[i]);
      }
    }
    console.log(selectedAnals)
    return selectedAnals;
  }

  const pageOne = () => (
    <div className="colFlexBox">
      <h1>Graph Options</h1><br></br>
      <div className="rowFlexBox">
        <h3>Live Data</h3><br></br>
        <input type="checkbox" id="liveDataCheckbox" name="liveData" value="true"></input>
      </div>
      
      <div className="spaceRowFlexBox">
        Port <input type="text" value="" size="5" ></input>
      </div>
      <div className="spaceRowFlexBox">
        Baud <input type="text" value="" size="5"></input>
      </div>

      <h3>Graph Types</h3>
        <select id="graphTypeSelect" className="graphTypeSelect">
          <option value="XYGraph">X-Y Graph</option>
          <option value="AccelCurve">AccelCurve</option>
          <option value="Gauge">1D Gauge</option>
          <option value="XYColour"> X-Y-Colour Graph</option>
        </select>
      <div className="buttonFlexBox">
      <button className="submitbutton" onClick={() => { listFiles(); showPage2(); } }>Next</button>
      </div>
    </div>
  )
  const pageTwo = () => (
    
    <div className="colFlexBox2"> 
      <h3>Choose Files</h3>
      <div className="scrollColFlexBox">
      {files.map((file) => {
        return (
          <div key={file}>
            <input type="checkbox" className="bigcheck" id={"Check_" + file} name={file} value={file}></input>
            <label htmlFor="{file}"> {file}</label><br></br>
          </div>
        )
      })}
      </div>
      <div className="buttonFlexBox">
        <button className="submitbutton" onClick={showPage1}>Back</button>
        <button className="submitbutton" onClick={() => { 
          getSelectedFiles(); 
          if(document.getElementById("graphTypeSelect").value === "XYColour") {
            setDimensions(3)
          } else {
            setDimensions(2)
          }
           showPage3(); }} >Next</button>
      </div>
      </div>
    
  )
  const pageThree = () => (
      <div className="colFlexBox2">
      <h3>Select Axis</h3>
        {columnGenerator(dimensions)}
        <button onClick={addSeries}>Add Series</button>
        <h3>Select Analyzers</h3>
        <div className="scrollColFlexBox">
          <div className="rowFlexBox"> <input type="checkbox" id="linearInterpolate" name="linearInterpolate" value="true"></input>
          <label htmlFor="linearInterpolate"> <div className="boldText">Linear Interpolation</div></label></div>
          <div className="rowFlexBox"><input type="checkbox" id="accelCurve" name="accelCurve" value="true"></input>
          <label htmlFor="accelCurve"><div className="boldText">Accel Curve Analyzer</div></label></div>
          <div className="rowFlexBox"><input type="checkbox" id="rollAvg" name="rollAvg" value="true"></input>
          <label htmlFor="rollAvg"> <div className="boldText">Rolling Average Analyzer</div></label></div>
  
      </div>
      <div className="buttonFlexBox">
        <button className="submitbutton" onClick={showPage2}>Back</button>
        <button className="submitbutton" onClick={()=> {handleSubmit();}}>Submit</button>
      </div>
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
