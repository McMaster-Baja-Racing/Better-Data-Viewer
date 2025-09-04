import { ReactNode, useState, useRef, useEffect } from 'react';
import styles from './GraphWrapper.module.scss';
import {fullscreenIcon, unfullscreenIcon, writeIcon, threeDotsIcon, addIcon} from '@assets/icons';
import { showErrorToast } from '@components/ui/toastNotification/ToastNotification';
import { useDashboard } from '@contexts/DashboardContext';

interface GraphWrapperProps {
  chartId?: string; 
  editOnClick: () => void;
  children: ReactNode;
}

export const GraphWrapper = ({ chartId, editOnClick, children }: GraphWrapperProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { title, charts, dispatch } = useDashboard();

  const handleFullscreenToggle = async () => {
    if (!document.fullscreenElement) {
      if (wrapperRef.current) {
        try {
          await wrapperRef.current.requestFullscreen();
          setIsFullscreen(true);
        } catch (err) {
          showErrorToast(`Failed to enter fullscreen: ${err instanceof Error ? err.message : String(err)}`);
        }
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (err) {
        showErrorToast(`Failed to exit fullscreen: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  };

  const handleAddChart = () => {
    const newChart = {
      id: `chart-${Date.now()}`,
      title: `Chart ${charts.length + 1}`
    };
    dispatch({ type: 'ADD_CHART', chart: newChart });
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

  // Get the title for this specific chart, fallback to dashboard title
  const chartTitle = chartId 
    ? charts.find(chart => chart.id === chartId)?.title || title
    : title;

  return (
    <div className={styles.graphWrapper} ref={wrapperRef}>
      <div className={styles.editBar}>
        <div className={styles.title}>{chartTitle}</div>
        <div className={styles.iconGroup}>
          <img 
            src={writeIcon} 
            className={styles.icon} 
            alt="Edit Graph" 
            onClick={editOnClick} 
          />
          <img
            src={isFullscreen ? unfullscreenIcon : fullscreenIcon}
            className={styles.icon}
            onClick={handleFullscreenToggle}
          />
          <img 
            src={addIcon} 
            className={styles.icon} 
            alt="Add Graph icon" 
            onClick={handleAddChart}
          />
          <img src={threeDotsIcon} className={styles.icon} alt="Options icon" />
        </div>
      </div>
      <div className={styles.graphContainer}>{children}</div>
    </div>
  );
};
