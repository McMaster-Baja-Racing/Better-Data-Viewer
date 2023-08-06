import '../styles/modalStyles.css';


const GraphSettings = ({setDisplayPage,setFiles}) => {
    
    const listFiles = () => {
      //If live data is checked, only show the default live data files
      // if (document.getElementById("liveDataCheckbox").checked) {
      //   setFiles(["F_GPS_SPEED.csv", "F_RPM_PRIM.csv", "F_RPM_SEC.csv", "F_THROTTLE.csv", "F_VEHICLE_SPEED.csv"]);
      //   return;
      // }
  
      // Should be of format [{key: "F_GPS_SPEED.csv", size: 1234, headers: ["header1", "header2", "header3"]}, ...]
      fetch(`http://${window.location.hostname}:8080/files`)
        .then(response => response.json())
        .then(data => {
          console.log(data)
          setFiles(data.files);
        })
    }

    return (
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
            <button className="submitbutton" onClick={() => { listFiles(); setDisplayPage(2); }}>Next</button>
          </div>
        </div>
      )


}

export default GraphSettings

