import { useDashboard } from '@contexts/DashboardContext';
import { addIcon } from '@assets/icons';
import styles from './addGraph.module.scss';

export const AddGraph = () => {
  const { charts, dispatch } = useDashboard();

  const handleAddChart = () => {
    const newChart = {
      id: `chart-${Date.now()}`,
      title: `Chart ${charts.length + 1}`
    };
    dispatch({ type: 'ADD_CHART', chart: newChart });
  };

  return (
    <button 
      className={styles.fab}
      onClick={handleAddChart}
      title="Add New Chart"
    >
      <img src={addIcon} alt="Add" className={styles.icon} />
    </button>
  );
};