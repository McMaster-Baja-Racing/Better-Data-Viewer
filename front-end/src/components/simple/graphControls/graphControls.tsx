import { useDashboard } from '@contexts/DashboardContext';
import styles from './graphControls.module.scss';

export const GraphControls = () => {
  const { charts, dispatch } = useDashboard();

  const handleAddChart = () => {
    if (charts.length >= 6) return; // Max 6 charts
    
    const newChart = {
      id: `chart-${Date.now()}`,
      title: `Chart ${charts.length + 1}`
    };
    dispatch({ type: 'ADD_CHART', chart: newChart });

  };

  const handleRemoveChart = () => {
    if (charts.length === 0) return;
    
    const lastChart = charts[charts.length - 1];
    dispatch({ type: 'REMOVE_CHART', id: lastChart.id });
  };

  return (
    <div className={styles.graphControls}>
      <button 
        className={styles.controlButton}
        onClick={handleRemoveChart}
        disabled={charts.length <= 1} // Don't let them remove the last chart
        title="Remove Chart"
      >
        -
      </button>
      
      <span className={styles.chartCount}>
        {charts.length}
      </span>
      
      <button 
        className={styles.controlButton}
        onClick={handleAddChart}
        disabled={charts.length >= 6}
        title="Add Chart"
      >
        +
      </button>
    </div>
  );
};