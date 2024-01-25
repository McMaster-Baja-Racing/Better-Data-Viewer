import '../../../styles/GraphSettingsStyles.css';

const GraphSettings = ({ movePage, graphType, setGraphType, liveCheck, setLiveCheck }) => {

  const getGraphType = () => {
    setGraphType(document.getElementById("graphTypeSelect").value);
    if (document.getElementById("graphTypeSelect").value == "video") setLiveCheck(false);
  }

  const getLiveCheck = () => {
    setLiveCheck(document.getElementById("liveDataCheckbox").checked);
  }

  return (
    <div className="graph-settings-container">
      <h1>Welcome to the Data Viewer!</h1>
      <h3>Instructions</h3>
      <ol>
        <li>Select the type of graph you want.</li>
        <li>Select the files you want to graph.</li>
        <li>Select the columns of your graph you want.</li>
        <li>Select the analyzer you want to use on your data.</li>
        <li>For more, repeat steps 3 & 4, clicking "Add Series" in between.</li>
      </ol>
      <h3>Graph Options</h3>
      <div className='graphOptions'>
        <div className="graphTypesBox">
          <div className="graphOptionsText">Graph Types</div>
          <div className="GraphTypeSelect">
            <select id="graphTypeSelect" onChange={getGraphType}>
              <option value="line">Line</option>
              <option value="spline">Spline</option>
              <option value="scatter">Scatter</option>
              <option value="colour">XYColour</option>
              <option value="video">Video</option>
            </select>
          </div>
        </div>
        <div className='liveDataBox'>
          <div className="graphOptionsText">Live Data</div>
          <input type="checkbox" id="liveDataCheckbox" name="liveData" value="true" disabled={graphType == "video"} checked={liveCheck} onChange={getLiveCheck}></input>
        </div> 
      </div>
      <button className="PageButton" onClick={() => { movePage(graphType == "video" ? 1 : 2) }}>Next</button>
    </div>
  )


}

export default GraphSettings

