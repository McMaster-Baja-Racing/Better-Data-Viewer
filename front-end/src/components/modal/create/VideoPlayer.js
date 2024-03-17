import React, { useEffect, useRef, useState } from 'react';
import '../../../styles/videoPlayerStyles.css';
import { useLocation } from 'react-router-dom';

const VideoPlayer = () => {
  
  const chartInformation = JSON.parse(decodeURIComponent(new URLSearchParams(useLocation().search).get('chartInformation')));
    
  const [videoURL, setVideoURL] = useState('');
  const videoRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0); // added
  const [duration, setDuration] = useState(0); // scrolly

  useEffect(() => {
    // Fetch data when the component mounts
    fetch(`http://${window.location.hostname}:8080/files/${chartInformation.video.key}`)
      .then((response) => response.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob) 
        setVideoURL(url);

        return () => {
          URL.revokeObjectURL(url);
        };
      });

      const handleTimeUpdate = () => {
        setCurrentTime(videoRef.current.currentTime ); // (*1000) Convert to milliseconds 
      };
  
      const handleDurationChange = () => {
        setDuration(videoRef.current.duration);
      }
  
      videoRef.current.addEventListener('timeupdate', handleTimeUpdate);
      videoRef.current.addEventListener('durationchange', handleDurationChange);
      return () => {
        videoRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        videoRef.current.removeEventListener('durationchange', handleDurationChange);
      };
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


  const seek = (event) => {
    const seekTime = event.target.value;
    videoRef.current.currentTime = seekTime;
  };


  return (
    <div className = "background">
        <div className = "pageWrap">
          <div className = "pageContainer">
            <div className = "videoContainerBox">
              <video src={videoURL} ref={videoRef} onClick={togglePlay} className = "center" id="video"/>
            </div>
            <div className="timeDisplay">
              {formatTime(currentTime)} / {formatTime(videoRef.current ? videoRef.current.duration : 0)}
            </div>
            <input type="range" min="0" max={duration} value={currentTime} onChange={seek} className="seekbar" />
          </div>
        </div>
    </div>
  );
};

export default VideoPlayer;