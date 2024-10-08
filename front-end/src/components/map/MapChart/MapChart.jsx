import React, { useState } from 'react';
import './MapChart.css';
import MapDisplay from '../MapDisplay/MapDisplay';
import LapTimes from '../LapTimes/LapTimes';

const MapChart = () => {
  const [laps, setLaps] = useState([]);
  const [gotoTime, setGotoTime] = useState(0);
  return (
    <div className="map_container">
      <div className="map_display_container">
        <MapDisplay setLapsCallback={setLaps} gotoTime={gotoTime} />
      </div>
      <div className="map_laptime_container">
        <LapTimes laps={laps} gotoTimeCallback={setGotoTime} />
      </div>
    </div>
  );
};

export default MapChart;