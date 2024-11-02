import React, { useEffect, useState } from 'react';
import '@styles/modalStyles.css';
import './VideoSelect.css';
import { AiFillFolder } from 'react-icons/ai';
import { filterFiles } from '@lib/videoUtils';

export const VideoSelect = ({ movePage, selectedVideo, setSelectedVideo, files, fileTimespans, videoTimespans }) => {

  const [filteredFiles, setFilteredFiles] = useState([]);

  useEffect(() => {
    setFilteredFiles(filterFiles(selectedVideo, files, fileTimespans));
  }, [selectedVideo, files, fileTimespans]);

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
                onChange={() => setSelectedVideo(videoTimespan)} 
                checked={selectedVideo === videoTimespan}
                disabled={fileTimespans.length === 0}
              />
              {(videoTimespan.key.split('.')[0]).replace('_', ' ')}
            </label>
          ))}
        </div>
        <div className="folderContainer">
          <label className='folderContainerLabel'>Available Folders</label>
          {filteredFiles.length === 0 && selectedVideo !== '' ? <label>No files found</label> : null}
          {[...new Set(filteredFiles.map(file => file.key.split('/')[0]))].map((folder, index) => (
            <label key={index} htmlFor={`folder-${index}`} className='folderLabel'>
              <AiFillFolder size={20} style={{ marginBottom: '-2%', marginRight: '3px' }}/>
              {folder}
            </label>
          ))}
        </div>
      </div>
      <div className="fileButtons">
        <button className="backButton" onClick={() => {
          setSelectedVideo({ key: '', start: '', end: '' }); movePage(-1);
        }}>Back</button>
        <button className="nextButton" onClick={() => {movePage(1);}}>Next</button>
      </div>
    </div>
  );
};