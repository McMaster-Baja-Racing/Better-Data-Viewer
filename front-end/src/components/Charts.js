import Chart from './Chart';
import '../styles/charts.css';

const Charts = ({ chartInformation, setModal, setButtonID }) => {

    return (
        <div className="charts">
            <div className="bigChart">
                <button  title="Create Graph" className="createGraph" onClick={() => { setButtonID(0); setModal('Create'); }}>
                    <img className="icon" src={process.env.PUBLIC_URL + 'icons/newGraph2.svg'} alt="Create Graph" />
                </button>
                <Chart chartInformation={chartInformation[0]}  />
                
            </div>
            <div><button  title="Create Graph" className="createGraph" onClick={() => { setButtonID(1); setModal('Create'); }}>
                    <img className="icon" src={process.env.PUBLIC_URL + 'icons/newGraph2.svg'} alt="Create Graph" />
                </button>
            <Chart chartInformation={chartInformation[1]} /></div>
            <div><button  title="Create Graph" className="createGraph" onClick={() => { setButtonID(2); setModal('Create'); }}>
                    <img className="icon" src={process.env.PUBLIC_URL + 'icons/newGraph2.svg'} alt="Create Graph" />
                </button>
            <Chart chartInformation={chartInformation[2]} /></div>
            <div><button  title="Create Graph" className="createGraph" onClick={() => { setButtonID(3); setModal('Create'); }}>
                    <img className="icon" src={process.env.PUBLIC_URL + 'icons/newGraph2.svg'} alt="Create Graph" />
                </button>
            <Chart chartInformation={chartInformation[3]} /></div>
        </div>
    )
}

export default Charts;