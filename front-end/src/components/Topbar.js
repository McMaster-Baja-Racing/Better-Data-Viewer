import '../styles/topbar.css';

const Topbar = ({ openModal, openModal1 }) => {

    //This function notifies the backend to begin listening on a certain port for live data
    var formData = new FormData();
    formData.append("port", "COM2");
    const beginLiveData = () => {
        fetch(`http://${window.location.hostname}:8080/live`, {
            method: "POST",
            body: formData,
        }).then((res) => {
            console.log(res);
        }).catch((err) => {
            console.log(err);
        });

    }

    return (
        <div className="topbar">
            <div className="title">Data Visualizer</div>
            <div className="buttons">
                <button className="beginLive" onClick={beginLiveData}>Begin Live Data</button>
                <button className="createGraph" onClick={openModal}>Create Graph</button>
                <button className="createGraph" onClick={openModal1}>Upload Files</button>
            </div>
        </div>
    );
}

export default Topbar;