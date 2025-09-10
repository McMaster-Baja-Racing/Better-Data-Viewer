import { useState } from 'react';
import Chart from '@components/legacy/views/Chart/Chart';
import { GraphWrapper } from '@components/simple/graphWrapper/GraphWrapper';
import { EmptyGraph } from '@components/simple/emptyGraph/EmptyGraph';
import { ChartOptionsProvider } from '@contexts/ChartOptionsContext';
import { ChartQueryProvider, useChartQuery } from '@contexts/ChartQueryContext';
import { useDashboard, ChartInstance } from '@contexts/DashboardContext';
import styles from './chartCard.module.scss';

interface ChartCardProps {
  chart: ChartInstance;
  onEditModeChange: (isEdit: boolean) => void;
}

export const ChartCard = ({ chart, onEditModeChange }: ChartCardProps) => {
  const { dispatch } = useDashboard();

  const handleEditClick = () => {
    dispatch({ type: 'FOCUS_CHART', id: chart.id });
  };

  return (
    <ChartOptionsProvider chartId={chart.id}>
      <ChartQueryProvider chartId={chart.id}>
        <div className={styles.chartCard}>
          <GraphWrapper 
            editOnClick={handleEditClick}
            title={chart.title} 
          >
            <ChartCardContent onEditClick={handleEditClick} />
          </GraphWrapper>
        </div>
      </ChartQueryProvider>
    </ChartOptionsProvider>
  );
};

const ChartCardContent = ({ onEditClick }: { onEditClick: () => void }) => {
  const { series } = useChartQuery();
  
  const hasData = series && series.length > 0 && series.some(s => s?.x?.source || s?.y?.source);

  return hasData ? (
    <Chart video={null} videoTimestamp={0} />
  ) : (
    <EmptyGraph onEditClick={onEditClick} />
  );
};