//CreateGraphModal.js
import ReactDom from "react-dom";
import '../../../styles/modalStyles.css';
import { useEffect, useState } from 'react';

export const VideoSelect = ({ movePage, chartInformation, selectedSeries, setSelectedSeries, selectedVideo, setSelectedVideo, }) => {

    // holds all the files which have been uploaded
    const [videos, setVideos] = useState([])

    const [files, setFiles] = useState([])

    useEffect(() => {
        // Fetch data when the component mounts
        fetch(`http://${window.location.hostname}:8080/timespan/folder/mp4`)
            .then((response) => response.json())
            .then((data) => {
            console.log(data.files)
            setVideos(data.files);
            });
        fetch(`http://${window.location.hostname}:8080/timespan/folder/csv`)
            .then((response) => response.json())
            .then((data) => {
            console.log(data.files)
            setFiles(data.files);
            });
        }, []); // Empty dependency array ensures that the fetch is only performed once
    // // This method will return headers when supplied with a list of files. Added support for folders is neccesary
    // const getHeaders = async (files) => {
    //   var col = [];

    //   files.forEach(file => {
    //     file.fileHeaders.forEach(header => {
    //       col.push({
    //         "header": header.trim(),
    //         "filename": file.key
    //       })
    //     })
    //   })

    //   setColumns(col);
    // }

    //render the modal JSX in the portal div.
    return ReactDom.createPortal(
        <div className="videoSelectContainer">
            <h3>Select Axis</h3>
            <div className="buttonFlexBox">
                <button className="submitButton" onClick={() => { movePage(1); }}>Submit</button>
            </div>
        </div>,
        document.getElementById("portal")
    );
};