import '../styles/GraphSettingsStyles.css';

const GraphSettings = ({ setDisplayPage, setFiles, setGraphType, setLiveCheck }) => {

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

  const graphType = () => {
    setGraphType(document.getElementById("graphTypeSelect").value);

  }

  const liveData = () => {
    setLiveCheck(document.getElementById("liveDataCheckbox").checked);
  }

  return (
    <div className="graph-settings-container">
      <h1>Welcome to the Data Viewer!</h1>
      <h3>Instructions</h3>
      <ol>
        <li>Select the type of graph you want</li>
        <li>Select the files you want to graph</li>
        <li>Select the column headers you want on your graph</li>
        <li>Select the analyzer you want to use on your data</li>
      </ol>
      <h3>Graph Options</h3>
      <div className='graphOptionsCol1'>
        <div className='liveDataBox'>
          <div className="textboxbold">Live Data</div><br></br>
          <input type="checkbox" id="liveDataCheckbox" name="liveData" value="true"></input>
        </div>
        <br/>
        <div className="graphTypesBox">
          <div className="textboxbold">Graph Types</div>
          <div className="GraphTypeSelect">
            <select id="graphTypeSelect" >
              <option value="line">line</option>
              <option value="spline">spline</option>
              <option value="scatter"> scatter</option>
            </select>
          </div>
        </div>
      </div>

      <button className="PageButton" onClick={() => { liveData(); graphType(); listFiles(); setDisplayPage(2); }}>Next</button>
      {/* 
      

      

      
      
      <button className="pageOneNextButton" onClick={() => { liveData(); graphType(); listFiles(); setDisplayPage(2); }}>Next</button> */}
    </div>
  )


}

export default GraphSettings

