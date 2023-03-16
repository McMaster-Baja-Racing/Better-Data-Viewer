//CreateGraphModal.js
import { useRef } from "react";
import ReactDom from "react-dom";
import '../styles/modalStyles.css';
import { useState, useEffect } from 'react';

export const CreateGraphModal = ({ setShowModal, fileTransfer }) => {

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
    addSeries();
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
      "files": seriesInfo,
      "live": document.getElementById("liveDataCheckbox").checked,
      "type": document.getElementById("graphTypeSelect").value
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

  var seriesInfo = []
  var seriescounter = 0;
  
  const addSeries = () => {
    
    var selectColumns = [];
    for (let i = 0; i < dimensions; i++) {
      selectColumns.push(JSON.parse(document.getElementsByClassName(i)[0].value));
    }
    
    seriesInfo.push({
      "columns": selectColumns,
      "analyze": {
        "analysis": getAnalysis(),
        "analyzerValues": getAnalyzerOptions()
      }
      
    })

    seriescounter++;

    console.log(seriesInfo)
  }
  var analNames = ["linearInterpolate","accelCurve", "rollAvg", "RDPCompression"];
  // Handles the selection of the analysis
  const getAnalysis = () => {
    var selectedAnals = [];
    for (var i = 0; i < analNames.length; i++) {
      if (document.getElementById(analNames[i]).checked) {
        selectedAnals.push(analNames[i]);
      }
    }
    return selectedAnals;
  }

  const getAnalyzerOptions = () => {
    var window = document.getElementById("rollavg").value;
    var epsilon = document.getElementById("epl").value;
    if (document.getElementById("rollAvg").checked) {
      console.log(window)
      return  window;
    }else if (document.getElementById("RDPCompression").checked) {
      console.log(epsilon)
      return epsilon;
    }else{
      return null;
    }
  }

  const pageOne = () => (
    <div className="colFlexBox">
      <h1>Graph Options</h1><br></br>
      <div className="rowFlexBox">
        <h3>Live Data</h3><br></br>
        <input type="checkbox" id="liveDataCheckbox" name="liveData" value="true"></input>
      </div>
    
      <label for="port">Port</label>
      <input type="text" id="port" name="port"></input> 
      <label for="baud">Baud</label>
      <input type="text" id="baud" name="baud"></input>
      
      <h3>Graph Types</h3><div className="pushLeftFlexBox">
        <select id="graphTypeSelect" className="graphTypeSelect">
          <option value="line">line</option>
          <option value="spline">spline</option>
          <option value="scatter"> scatter</option>
        </select>
      </div>
      <div className="pushRightFlexBox">
      <button className="submitbutton" onClick={() => { listFiles(); showPage2(); } }>Next</button>
      </div>
    </div>
  )
  const pageTwo = () => (
    
    <div className="colFlexBox"> 
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
      <div className="colFlexBox">
      <h3>Select Axis</h3>
        {columnGenerator(dimensions)}
        <div className="pushLeftFlexBox">
          <button onClick={addSeries}>Add Series</button>
        </div>
        <h3>Select Analyzers</h3>
        <div className="scrollColFlexBox">
          {analNames.map((anal) => {
            return (
              <div key={anal}>
                <div className="rowFlexBox"><input type="checkbox" id={anal} name={anal} value="true"></input>
                <label htmlFor={anal}><div className="boldText">{anal}</div></label></div>
              </div>
            )
          }
          )}
      </div>
      <div className="rowFlexBox"> 
      <label for="rollavg">Rolling Avg Window:</label>
      <input type="text" id="rollavg" name="rollavg" ></input> 
      <label for="epl">Eplison Value:</label>
      <input type="text" id="epl" name="epl" ></input>
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
