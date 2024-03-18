import '../../../styles/modalStyles.css';
import '../../../styles/videoSelectStyles.css';
import { AiFillFolder } from 'react-icons/ai';

export const VideoSelect = ({ movePage, selectedVideo, setSelectedVideo, files, videoSyncFiles, setVideoSyncFiles, fileTimespans, videoTimespans }) => {
    
    // Filter files to those that have a timestamp wihtin the range of the selected video
    const filterFiles = (videoTimespan) => {
        let tempVideoSyncFiles = []
        const videoStart = new Date (videoTimespan.start)
        const videoEnd = new Date (videoTimespan.end)
        files.forEach(file => {
            const fileTimespan = fileTimespans.find(timespan => timespan.key == file.key)
            if (fileTimespan == undefined) return
            const fileStart = new Date(fileTimespan.start)
            const fileEnd = new Date(fileTimespan.end)
            if (fileStart < videoEnd && videoStart < fileEnd) tempVideoSyncFiles.push(file)
        })
        setSelectedVideo(videoTimespan)
        setVideoSyncFiles(tempVideoSyncFiles)
    }

    console.log(videoTimespans)

    //render the modal JSX in the portal div.
    return (
        <div className="videoSelectContainer">
            <h3>Select Video</h3>
            <div className="videoSelect">
                <div className="videoContainer">
                    {videoTimespans.map((videoTimespan, index) => (
                        <label
                            key={index}
                            className={`videoLabel ${selectedVideo === videoTimespan ? 'selected' : ''}`}
                            htmlFor={`video-${index}`}
                        >
                            <input 
                                type="radio"
                                id={`video-${index}`} 
                                name="video" 
                                value={videoTimespan} 
                                onChange={() => {filterFiles(videoTimespan)}} 
                                checked={selectedVideo === videoTimespan}
                                disabled={fileTimespans.length === 0}
                            />
                            {(videoTimespan.key.split('.')[0]).replace('_', ' ')}
                        </label>
                    ))}
                </div>
                <div className="folderContainer">
                <label className='folderContainerLabel'>Available Folders</label>
                {videoSyncFiles.length == 0 && selectedVideo != '' ? <label>No files found</label> : null}
                {[...new Set(videoSyncFiles.map(file => file.key.split('/')[0]))].map((folder, index) => (
                    <label key={index} htmlFor={`folder-${index}`} className='folderLabel'>
                        <AiFillFolder size={20} style={{ marginBottom: '-2%', marginRight: '3px' }}/>
                        {folder}
                    </label>
                ))}
                </div>
            </div>
            <div className="fileButtons">
                <button className="backButton" onClick={() => {setSelectedVideo(''); movePage(-1)}}>Back</button>
                <button className="nextButton" onClick={() => {movePage(1)}}>Next</button>
            </div>
        </div>
    );
};