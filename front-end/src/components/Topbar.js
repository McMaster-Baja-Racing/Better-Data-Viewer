import '../styles/topbar.css';

const Topbar = ({ openModal, openModal1 }) => {
    return (
        <div className="topbar">
            <div className="title">Data Visualizer</div>
            <div className="buttons">
                <button className="createGraph" onClick={openModal}>Create Graph</button>
                <button className="createGraph" onClick={openModal1}>Upload Files</button>
            </div>
        </div>
    );
}

export default Topbar;