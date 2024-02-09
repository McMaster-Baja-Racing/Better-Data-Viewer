import { useState } from 'react';
import '../../styles/mapChart.css';
import MapDisplay from './MapDisplay';
import ToolSelection from './ToolSelection';
let coords = require('./testData.json')

const tools = ["Start",  "End", "Checkpoint"]

const MapChart = () => {
    const [currTool, setCurrTool] = useState(tools[0]);
    function changeTool(index) {
        setCurrTool(tools[index]);
    }
    return (
        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "row", flexWrap: "wrap"}}>
            <div id={"ui"} style={{flex: "0 0 100%",  height: "100px", margin:"8px", textAlign: "left"}}>
                <ToolSelection options={tools} onChange={changeTool}> </ToolSelection>
            </div>
            <div style={{flex: "0 0 100%"}}>
                <MapDisplay coords={coords} toolType={currTool}/>
            </div>
        </div>
    )
}

export default MapChart;