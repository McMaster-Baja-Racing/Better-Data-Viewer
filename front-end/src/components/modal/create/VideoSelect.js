import '../../../styles/modalStyles.css';
import '../../../styles/videoSelectStyles.css';
import { AiFillFolder } from 'react-icons/ai';

export const VideoSelect = ({ movePage, selectedVideo, setSelectedVideo, files, filteredFiles, setFilteredFiles, fileTimestamps, videoTimestamps }) => {
    
    // Filter files to those that have a timestamp wihtin the range of the selected video
    const filterFiles = (videoTimestamp) => {
        let tempFilteredFiles = []
        const videoStart = new Date (videoTimestamp.fileHeaders[0])
        const videoEnd = new Date (videoTimestamp.fileHeaders[1])
        files.forEach(file => {
            const fileTimestamp = fileTimestamps.find(timestamp => timestamp.key == file.key)
            if (fileTimestamp == undefined) return
            const fileStart = new Date(fileTimestamp.fileHeaders[0])
            const fileEnd = new Date(fileTimestamp.fileHeaders[1])
            if (fileStart < videoEnd && videoStart < fileEnd) tempFilteredFiles.push(file)
        })
        setSelectedVideo(videoTimestamp)
        setFilteredFiles(tempFilteredFiles)
    }

    //render the modal JSX in the portal div.
    return (
        <div className="videoSelectContainer">
            <h3>Select Video</h3>
            <div className="videoSelect">
                <div className="videoContainer">
                    {videoTimestamps.map((videoTimestamp, index) => (
                        <label
                            key={index}
                            className={`videoLabel ${selectedVideo === videoTimestamp ? 'selected' : ''}`}
                            htmlFor={`video-${index}`}
                        >
                            <input 
                                type="radio"
                                id={`video-${index}`} 
                                name="video" 
                                value={videoTimestamp} 
                                onChange={() => {filterFiles(videoTimestamp)}} 
                                checked={selectedVideo === videoTimestamp}
                                disabled={fileTimestamps.length === 0}
                            />
                            {(videoTimestamp.key.split('.')[0]).replace('_', ' ')}
                        </label>
                    ))}
                </div>
                <div className="folderContainer">
                <label className='folderContainerLabel'>Available Folders</label>
                {filteredFiles.length == 0 && selectedVideo != '' ? <label>No files found</label> : null}
                {[...new Set(filteredFiles.map(file => file.key.split('/')[0]))].map((folder, index) => (
                    <label key={index} htmlFor={`folder-${index}`} className='folderLabel'>
                        <AiFillFolder size={20} style={{ marginBottom: '-5%', marginRight: '3px' }}/>
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