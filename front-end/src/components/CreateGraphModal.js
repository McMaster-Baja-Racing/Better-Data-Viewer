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
        for (const file of selectedFiles) {
          fetch(`http://${window.location.hostname}:8080/files/${file}/info`)
            .then(response => {
              var c = 0;
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

    console.log(seriesInfo)
  }
  //make a list of analyzer objects
   
  var analNamess = [["Linear Interpolate","linearInterpolate",true],["Accel Curve", "accelCurve",true], ["Rolling Average", "rollAvg",true], ["RDP Compression","RDPCompression",true],["sGolay","sGolay",true]];
  
  var objectsList = [];
  const makeAnalObjects = () => {

    for (var i = 0; i < analNamess.length; i++) {
      var name = analNamess[i][0];
      var code = analNamess[i][1];
      var variable = analNamess[i][2];
      
      var obj = {
        name: name,
        code: code,
        variable : variable
      };
      
      objectsList.push(obj);
    }
  }

  // Handles the selection of the analysis
  const getAnalysis = () => {
    var selectedAnals = [];
    for (var i = 0; i < objectsList.length; i++) {
      if (document.getElementById(objectsList[i].code).checked) {
        selectedAnals.push(objectsList[i].code);
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

  const displayAnalyzers = () => {
    makeAnalObjects();
    var elementsList = [];
    
    for (var i = 0; i < objectsList.length; i++) {
      var element = (
        <div>
          <div className="spaceRowFlexBox">
            <div>
              <input type="checkbox" id={objectsList[i].code} name={objectsList[i].name} value="true" />
              <label htmlFor={objectsList[i].code}>{objectsList[i].name}</label>
            </div>
            <button className="btn">i</button>
          </div>
        </div>
      );
      
      elementsList.push(element);
    }
    
    return elementsList;
  }
  
  const pageOne = () => (
    <div className="colFlexBox">
      <h1>Graph Options</h1><br></br>
      <div className="rowFlexBox">
        <h3>Live Data</h3><br></br>
        <input type="checkbox" id="liveDataCheckbox" name="liveData" value="true"></input>
      </div>
    
      <label htmlFor="port">Port</label>
      <input type="text" id="port" name="port"></input> 
      <label htmlFor="baud">Baud</label>
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
          displayAnalyzers();showPage3(); }} >Next</button>
      </div>
      </div>
    
  )
  const pageThree = () => (
      <div className="colFlexBox">
      <h3>Select Axis</h3>
      <div className="rowFlexBox">
        {columnGenerator(dimensions)}
        </div>
        <div className="pushLeftFlexBox">
          <button onClick={addSeries}>Add Series</button>
        </div>
        <h3>Select Analyzers</h3>
        <div className="scrollColFlexBox">
        {displayAnalyzers()}
      </div>
      <div className="rowFlexBox"> 
      <label htmlFor="rollavg">Rolling Avg Window:</label>
      <input type="text" id="rollavg" name="rollavg" ></input> 
      <label htmlFor="epl">Eplison Value:</label>
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
