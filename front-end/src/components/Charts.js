import Chart from './Chart';
import '../styles/charts.css';

const Charts = ({ chartInformation }) => {

    return (
        <div className="charts">
            <div className="bigChart">
                <Chart chartInformation={chartInformation} />
            </div>
        </div>
    )
}

export default Charts;