import { ReactNode, useState, useRef, useEffect } from 'react';
import styles from './GraphWrapper.module.scss';
import fullscreenIcon from '@assets/icons/fullscreen.svg';
import unfullscreenIcon from '@assets/icons/un-fullscreen.svg';
import write from '@assets/icons/write.svg';
import threedots from '@assets/icons/threedots.svg';

interface GraphWrapperProps {
  title: string;
  children: ReactNode;
}

export const GraphWrapper = ({ title, children }: GraphWrapperProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreenToggle = async () => {
    // If nothing is in fullscreen, request fullscreen on our wrapper element
    if (!document.fullscreenElement) {
      if (wrapperRef.current) {
        try {
          await wrapperRef.current.requestFullscreen();
          setIsFullscreen(true);
        } catch (err) {
          console.error('Failed to enter fullscreen:', err);
        }
      }
    } else {
      // If already in fullscreen, exit it
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (err) {
        console.error('Failed to exit fullscreen:', err);
      }
    }
  };

  // Listen for native fullscreen changes to keep state in sync
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className={styles.graphWrapper} ref={wrapperRef}>
      <div className={styles.editBar}>
        <div className={styles.title}>{title}</div>
        <div className={styles.iconGroup}>
          <img src={write} className={styles.icon} alt="Write icon" />
          <img
            src={isFullscreen ? unfullscreenIcon : fullscreenIcon}
            className={styles.icon}
            onClick={handleFullscreenToggle}
            style={{ cursor: 'pointer' }}
            alt="Fullscreen toggle icon"
          />
          <img src={threedots} className={styles.icon} alt="Options icon" />
        </div>
      </div>
      <div className={styles.graphContainer}>{children}</div>
    </div>
  );
};
