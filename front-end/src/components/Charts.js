import Chart from './Chart';
import '../styles/charts.css';
import newGraphImg from '../assets/icons/newGraph2.svg';
import chartStyles from './chartsConfig';

const Charts = ({ chartInformation, setModal, setButtonID, numGraphs }) => {

    return (
        <div className="charts" style={chartStyles[numGraphs]}>
            {Array.from({ length: numGraphs }).map((_, index) => {
                return (
                    <div key={index} className="singleChart" style={{ gridColumn: chartStyles[numGraphs].gridColumn[index] }}>
                        <Chart chartInformation={chartInformation[index]} />
                        <button title="Create Graph" className="createGraph" onClick={() => { setButtonID(index); setModal('Create'); }}>
                            <img className="icon" src={newGraphImg} alt="Create Graph" />
                        </button>
                    </div>
                )
            })}
        </div>
    )
}

export default Charts;