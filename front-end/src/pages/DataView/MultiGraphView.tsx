import { useEffect } from 'react';
import { useDashboard } from '@contexts/DashboardContext';
import { ChartCard } from '@components/composite/chartCard/chartCard'; 
import { viewStyles } from '@lib/viewsConfig';
import styles from './MultiGraphView.module.scss';

interface MultiGraphViewProps {
  onEditModeChange: (isEdit: boolean) => void;
}

export const MultiGraphView = ({ onEditModeChange }: MultiGraphViewProps) => {
  const { charts, dispatch } = useDashboard();
  const numCharts = Math.min(charts.length, 6);

  // Auto-create first chart if none exist
  useEffect(() => {
    if (charts.length === 0) {
      const defaultChart = {
        id: `chart-${Date.now()}`,
        title: 'Chart 1'
      };
      dispatch({ type: 'ADD_CHART', chart: defaultChart });
    }
  }, [charts.length, dispatch]);

  useEffect(() => {
    onEditModeChange(false);
  }, [onEditModeChange]);

  if (charts.length === 0) {
    return null;
  }

  const gridStyle = viewStyles[numCharts];

  return (
    <div 
      className={styles.multiGraphView} 
      data-chart-count={charts.length}
      style={{
        display: 'grid',
        gridTemplateColumns: gridStyle.gridTemplateColumns,
        gridTemplateRows: gridStyle.gridTemplateRows,
        gap: '1rem',
        height: '100%',
        width: '100%'
      }}
    >
      {charts.slice(0, 6).map((chart, index) => (
        <div
          key={chart.id}
          className={styles.chartContainer}
          style={{
            gridColumn: gridStyle.gridColumn[index]
          }}
        >
          <ChartCard
            chart={chart}
            onEditModeChange={onEditModeChange}
            isMultiView={charts.length > 1} 
          />
        </div>
      ))}
    </div>
  );
};