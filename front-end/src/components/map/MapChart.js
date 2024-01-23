import Chart from '../Chart';
import MapDisplay from './MapDisplay';
import '../../styles/mapChart.css'

const MapChart = ({ chartInformation, bounds, zoom }) => {
    console.log(chartInformation)
    return(
        <div id={"mapChart"} style={{top: "0", left: "0"}}>
            <MapDisplay bounds={bounds} zoom={zoom}/>
        </div>
    )
}

export default MapChart;