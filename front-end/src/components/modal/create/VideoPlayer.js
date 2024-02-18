import React, { useEffect, useRef, useState } from 'react';
import '../../../styles/videoPlayerStyles.css';
import { useParams } from 'react-router-dom';

const VideoPlayer = () => {

  const { key } = useParams();

  useEffect(() => {
    // Fetch data when the component mounts
    fetch(`http://${window.location.hostname}:8080/files/${key}`)
      .then((response) => response.blob())
      .then((blob) => {
        setVideoURL(URL.createObjectURL(blob));
      });
  }, []); // Empty dependency array ensures that the fetch is only performed once

  
  const [videoURL, setVideoURL] = useState('');
  const videoRef = useRef(null);

  const togglePlay = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  }

  return (
    <div>
      <video src={videoURL} ref={videoRef} onClick={togglePlay} />
    </div>
  );
};

export default VideoPlayer;