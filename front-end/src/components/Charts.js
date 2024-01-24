import Chart from './Chart';
import '../styles/charts.css';

const Charts = ({ chartInformation }) => {

    return (
        <div className="charts">
            <div className="bigChart">
                <Chart chartInformation={chartInformation[0]} />
            </div>
            <Chart chartInformation={chartInformation[0]} />
            <Chart chartInformation={chartInformation[0]} />
            <Chart chartInformation={chartInformation[0]} />
        </div>
    )
}

export default Charts;