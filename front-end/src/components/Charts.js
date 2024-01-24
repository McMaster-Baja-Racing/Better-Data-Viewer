import Chart from './Chart';
import '../styles/charts.css';

const Charts = ({ chartInformation }) => {

    return (
        <div className="charts">
            <Chart chartInformation={chartInformation} />
        </div>
    )
}

export default Charts;