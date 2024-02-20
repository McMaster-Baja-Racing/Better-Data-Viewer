import React, { useEffect, useRef, useState } from 'react';
import '../../../styles/videoPlayerStyles.css';
import { useParams } from 'react-router-dom';

const VideoPlayer = () => {
  
  const { key } = useParams();
    
  const [videoURL, setVideoURL] = useState('');
  const videoRef = useRef(null);

  useEffect(() => {
    // Fetch data when the component mounts
    fetch(`http://${window.location.hostname}:8080/files/${key}`)
      .then((response) => response.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob)
        setVideoURL(url);

        return () => {
          URL.revokeObjectURL(url);
        };
      });
  }, []); // Empty dependency array ensures that the fetch is only performed once

  useEffect(() => {
    const handleTimeUpdate = () => {
      // setvideoTimespan(videoRef.current.currentTime * 1000); // Convert to milliseconds
    };
    videoRef.current.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      videoRef.current.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, []);

  // useEffect(() => {
  //   const newTimestamp = chartTimestamp - offset;
  //   if (videoTimespan != newTimestamp) setvideoTimespan(newTimestamp);
  //   if (newTimestamp) videoRef.current.currentTime = newTimestamp / 1000
  // }, [chartTimestamp, offset]);

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