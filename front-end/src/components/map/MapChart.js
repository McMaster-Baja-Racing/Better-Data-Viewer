import { useState } from 'react';
import '../../styles/mapChart.css';
import MapDisplay from './MapDisplay';
import LapTimes from './LapTimes';
let coords = require('./testData.json')

const MapChart = () => {
    const [laps, setLaps] = useState([]);
    const [gotoTime, setGotoTime] = useState(0);
    return (
        <div className="map_container">
            <div className="map_display_container">
                <MapDisplay coords={coords} setLapsCallback={setLaps} gotoTime={gotoTime}/>
            </div>
            <div className="map_laptime_container">
                <LapTimes laps={laps} gotoTimeCallback={setGotoTime}/>
            </div>
        </div>
    )
}

export default MapChart;