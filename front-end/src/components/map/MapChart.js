import { useState } from 'react';
import '../../styles/mapChart.css';
import MapDisplay from './MapDisplay';
import LapTimes from './LapTimes';
let coords = require('./testData.json')

const MapChart = () => {
    const [laps, setLaps] = useState([]);
    return (
        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "row", flexWrap: "wrap"}}>
            <div style={{flex: "4 0 75%"}}>
                <MapDisplay coords={coords} setLapsCallback={setLaps}/>
            </div>
            <div style ={{flex: "0 0 25%", color: "black"}}>
                <LapTimes laps={laps}/>
            </div>
        </div>
    )
}

export default MapChart;