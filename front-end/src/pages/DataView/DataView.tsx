import Chart from '@components/legacy/views/Chart/Chart';
import { GraphWrapper } from '@components/simple/graphWrapper/GraphWrapper';
import { RightSidebar } from '@components/ui/rightSidebar/RightSidebar';
import { useEffect, useState } from 'react';
import { EditSidebar } from '@components/composite/editSidebar/EditSidebar';
import { ChartOptionsProvider } from '@contexts/ChartOptionsContext';
import { useDashboard } from '@contexts/DashboardContext';
import { useChartQuery } from '@contexts/ChartQueryContext';
import { Button } from '@components/ui/button/Button';
import styles from './DataView.module.scss';

export const DataView = () => {
  return (
    <ChartOptionsProvider>
      <DataViewContent />
    </ChartOptionsProvider>
  );
};

const DataViewContent = () => {
  const { series } = useChartQuery();
  const { sources } = useDashboard();
  
  // Open sidebar by default when there's no data to help users get started
  const hasInitialData = series && series.length > 0 && series.some(s => s?.x?.source || s?.y?.source);
  const [isOpen, setIsOpen] = useState(!hasInitialData);

  // Update sidebar state when series changes
  useEffect(() => {
    const hasValidData = series && series.length > 0 && series.some(s => s?.x?.source || s?.y?.source);
    if (!hasValidData) {
      setIsOpen(true); // Keep sidebar open when no data
    }
  }, [series]);

  // Check if we have any complete series data to display
  const hasData = series && series.length > 0 && series.some(s => s?.x?.source || s?.y?.source);

  return (
    // TODO: Extract this title better
    <RightSidebar
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      mainContent={
        <GraphWrapper 
          editOnClick={() => setIsOpen(!isOpen)}
        >
          {hasData ? (
            <Chart
              video={null}
              videoTimestamp={0}
            />
          ) : (
            <div className={styles.emptyState}>
              <h2 className={styles.emptyStateHeading}>
                Create Your Graph
              </h2>
              <p className={styles.emptyStateDescription}>
                Get started by selecting data sources from the sidebar to visualize your data.
              </p>
              <Button
                paddingY={'0.5rem'}
                onClick={() => setIsOpen(true)}
              >
                Edit Graph
              </Button>
            </div>
          )}
        </GraphWrapper>
      }
      sidebarContent={
        <EditSidebar 
          sources={sources}
        />
      }
    />
  );
};