import Chart from './Chart';
import '../styles/charts.css';
import newGraphImg from '../assets/icons/newGraph2.svg';

const Charts = ({ chartInformation, setModal, setButtonID }) => {

    const chartSizes = ["bigChart", "smallChart", "smallChart", "smallChart"]

    return (
        <div className="charts">
            {chartSizes.map((name, index) => {
                return (
                    <div key={index} className={name}>
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