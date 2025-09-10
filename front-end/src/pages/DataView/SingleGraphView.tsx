import { useState, useEffect } from 'react';
import Chart from '@components/legacy/views/Chart/Chart';
import { GraphWrapper } from '@components/simple/graphWrapper/GraphWrapper';
import { RightSidebar } from '@components/ui/rightSidebar/RightSidebar';
import { EditSidebar } from '@components/composite/editSidebar/EditSidebar';
import { ChartOptionsProvider } from '@contexts/ChartOptionsContext';
import { ChartQueryProvider, useChartQuery } from '@contexts/ChartQueryContext';
import { useDashboard } from '@contexts/DashboardContext';
import { EmptyGraph } from '@components/simple/emptyGraph/EmptyGraph';

interface SingleGraphViewProps {
  chartId: string;
  onEditModeChange: (isEdit: boolean) => void;
}

export const SingleGraphView = ({ chartId, onEditModeChange }: SingleGraphViewProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const { dispatch, sources, charts } = useDashboard();
  
  const chart = charts.find(c => c.id === chartId);
  
  useEffect(() => {
    onEditModeChange(isOpen);
  }, [isOpen, onEditModeChange]);

  const handleClose = () => {
    dispatch({ type: 'FOCUS_CHART', id: null });
  };

  const handleToggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  if (!chart) {
    handleClose();
    return null;
  }

  return (
    <ChartOptionsProvider chartId={chartId}>
      <ChartQueryProvider chartId={chartId}>
        <RightSidebar
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          onClose={handleClose}
          mainContent={
            <GraphWrapper 
              editOnClick={handleToggleSidebar}
            >
              <SingleGraphContent onEditClick={handleToggleSidebar} />
            </GraphWrapper>
          }
          sidebarContent={
            <EditSidebar sources={sources} />
          }
        />
      </ChartQueryProvider>
    </ChartOptionsProvider>
  );
};

const SingleGraphContent = ({ onEditClick }: { onEditClick: () => void }) => {
  const { series } = useChartQuery();
  
  const hasData = series && series.length > 0 && series.some(s => s?.x?.source || s?.y?.source);

  return hasData ? (
    <Chart video={null} videoTimestamp={0} />
  ) : (
    <EmptyGraph onEditClick={onEditClick} />
  );
};