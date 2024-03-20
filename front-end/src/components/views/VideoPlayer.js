import React, { useEffect, useRef, useState } from 'react';
import '../../styles/videoPlayerStyles.css';
import { getDuration } from '../../lib/videoUtils';

const VideoPlayer = ({ video, videoTimestamp, setVideoTimestamp }) => {

  const [videoURL, setVideoURL] = useState('');
  const videoRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const duration = getDuration(video) / 1000;
  const [prevState, setPrevState] = useState();

  useEffect(() => {
    // Fetch data when the component mounts
    fetch(`http://${window.location.hostname}:8080/files/${video.key}`)
      .then((response) => response.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob) 
        setVideoURL(url);

        return () => {
          URL.revokeObjectURL(url);
        };
      });
  }, []); // Empty dependency array ensures that the fetch is only performed once

  const togglePlay = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  const formatTime = (seconds) => {  // the time display, converting past time to minutes
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const updateTimestamp = () => {
    const time = videoRef.current.currentTime;
    setCurrentTime(time);
    setVideoTimestamp(time*1000)
  }
  
  const seek = (event) => {
    const seekTime = event.target.value;
    videoRef.current.currentTime = seekTime;
  };

  const seekDown = () => {
    setPrevState(videoRef.current.paused);
    videoRef.current.pause();
  }

  const seekUp = () => {
    if (!prevState) {
      videoRef.current.play();
    }
  }

  return (
    <div className = "background">
        <div className = "pageWrap">
          <div className = "pageContainer">
            <div className = "videoContainerBox">
              <video src={videoURL} ref={videoRef} onTimeUpdate={updateTimestamp} onClick={togglePlay} className = "center" id="video"/>
            </div>
            <div className="timeDisplay">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
            <input type="range" step={"0.1"} min="0" max={duration} value={currentTime} onChange={seek} onMouseDown={seekDown} onMouseUp={seekUp} className="seekbar" />
          </div>
        </div>
    </div>
  );
};

export default VideoPlayer;