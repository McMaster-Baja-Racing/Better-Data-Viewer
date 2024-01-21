import Chart from '../Chart';
import MapDisplay from './MapDisplay';
import '../../styles/mapChart.css'

const MapChart = ({ chartInformation, center, zoom }) => {
    return(
        <div id={"mapChart"} style={{top: "0", left: "0"}}>
            <Chart id="chartForeground" chartInformation={chartInformation} bg={"#ffffff00"} />
            <MapDisplay center={center} zoom={zoom}/>
        </div>
    )
}

export default MapChart;