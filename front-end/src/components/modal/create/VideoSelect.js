//CreateGraphModal.js
import ReactDom from "react-dom";
import '../../../styles/modalStyles.css';
import { useEffect, useState } from 'react';

export const VideoSelect = ({ movePage, selectedVideo, setSelectedVideo, files, setFilteredFiles }) => {

    const [videoTimestamps, setVideoTimestamps] = useState([])

    const [fileTimestamps, setFileTimestamps] = useState([])

    useEffect(() => {
        // Fetch data when the component mounts
        fetch(`http://${window.location.hostname}:8080/timespan/folder/mp4`)
            .then((response) => response.json())
            .then((data) => {
            console.log(data.files)
            setVideoTimestamps(data.files);
            });
        fetch(`http://${window.location.hostname}:8080/timespan/folder/csv`)
            .then((response) => response.json())
            .then((data) => {
            console.log(data.files)
            setFileTimestamps(data.files);
            });
        }, []); // Empty dependency array ensures that the fetch is only performed once

    //render the modal JSX in the portal div.
    return (
        <div className="videoSelectContainer">
            <h3>Select Video</h3>
            <div className="videoSelect">
                <div className="videoContainer">

                </div>
                <div className="folderContainer">
                    
                </div>
            </div>
            <div className="fileButtons">
                <button className="backButton" onClick={() => {movePage(-1)}}>Back</button>
                <button className="nextButton" onClick={() => {movePage(1)}}>Next</button>
            </div>
        </div>
    );
};