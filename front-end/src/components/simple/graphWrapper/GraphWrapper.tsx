import { ReactNode, useState, useRef, useEffect } from 'react';
import styles from './GraphWrapper.module.scss';
import fullscreenIcon from '@assets/icons/fullscreen.svg';
import unfullscreenIcon from '@assets/icons/un-fullscreen.svg';
import write from '@assets/icons/write.svg';
import threedots from '@assets/icons/threedots.svg';

interface GraphWrapperProps {
  title: string;
  editOnClick: () => void;
  children: ReactNode;
}

export const GraphWrapper = ({ title, editOnClick, children }: GraphWrapperProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreenToggle = async () => {
    if (!document.fullscreenElement) {
      if (wrapperRef.current) {
        try {
          await wrapperRef.current.requestFullscreen();
          setIsFullscreen(true);
        } catch (err) {
          alert('Failed to enter fullscreen: ' + err);
        }
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (err) {
        alert('Failed to exit fullscreen: ' + err);
      }
    }
  };

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
          <img src={write} className={styles.icon} alt="Edit Graph" onClick={editOnClick} />
          <img
            src={isFullscreen ? unfullscreenIcon : fullscreenIcon}
            className={styles.icon}
            onClick={handleFullscreenToggle}
          />
          <img src={threedots} className={styles.icon} alt="Options icon" />
        </div>
      </div>
      <div className={styles.graphContainer}>{children}</div>
    </div>
  );
};
