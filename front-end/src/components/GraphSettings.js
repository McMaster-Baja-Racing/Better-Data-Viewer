import '../styles/modalStyles.css';
import '../styles/GraphSettingsStyles.css';

const GraphSettings = ({setDisplayPage,setFiles,setGraphType, setLiveCheck}) => {
    
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
          setFiles(data.files);})
    }

    const graphType = () => {
      setGraphType (document.getElementById("graphTypeSelect").value);
      
    }

    const liveData = () => {
      setLiveCheck (document.getElementById("liveDataCheckbox").checked);
    }

    return (
        <div className="graph-settings-container">
          <div className="NoSpaceBox">
          <h1>Welcome to the Data Viewer!</h1>
          <h3>Instructions</h3>
    1. Select the type of graph you want
    <p>2. Select the files you want to graph</p>
    <p>3. Select the column headers you want on your graph</p>
    <p>4. Select the analyzer you want to use on your data</p>
    <p>5. Click "Submit"</p>

    <div className='header2'>Graph Options</div>
    <br></br>
        
          <div className='liveDataBox'>
            <div classname ="textboxbold">Live Data</div><br></br>
            <input type="checkbox" id="liveDataCheckbox" name="liveData" value="true"></input>
          </div> 
          <br></br>
          <div classname ="textboxbold">Graph Types</div>
          <div className="GraphTypeSelect">
            <select id="graphTypeSelect" >
              <option value="line">line</option>
              <option value="spline">spline</option>
              <option value="scatter"> scatter</option>
            </select>
          </div>
          <div className="GraphSettingsNextButton">
            <button className="pageOneNextButton" onClick={() => {liveData(); graphType(); listFiles(); setDisplayPage(2);  }}>Next</button>
          </div></div>
        </div>
      )


}

export default GraphSettings

