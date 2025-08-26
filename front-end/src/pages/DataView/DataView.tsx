import Chart from '@components/legacy/views/Chart/Chart';
import { GraphWrapper } from '@components/simple/graphWrapper/GraphWrapper';
import { RightSidebar } from '@components/ui/rightSidebar/RightSidebar';
import { useEffect, useState } from 'react';
import { EditSidebar } from '@components/composite/editSidebar/EditSidebar';
import { ChartOptionsProvider } from '@contexts/ChartOptionsContext';
import { useDashboard } from '@contexts/DashboardContext';
import { useChartQuery } from '@contexts/ChartQueryContext';

export const DataView = () => {
  return (
    <ChartOptionsProvider>
      <DataViewContent />
    </ChartOptionsProvider>
  );
};

const DataViewContent = () => {
  const { series } = useChartQuery();
  const { sources, dispatch: dashboardDispatch } = useDashboard();
  
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

  // Handler for updating sources when new files are added
  const handleSourcesUpdate = (newSources: string[]) => {
    dashboardDispatch({ type: 'ADD_SOURCES', sources: newSources });
  };

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
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              textAlign: 'center',
              padding: '3rem',
              color: 'var(--text-colour)'
            }}>
              <h2 style={{ 
                fontSize: '3.5rem', 
                marginBottom: '1.5rem',
                fontWeight: '300',
                color: 'var(--text-colour)'
              }}>
                Create Your Graph
              </h2>
              <p style={{ 
                fontSize: '1.5rem',
                marginBottom: '3rem',
                maxWidth: '500px',
                lineHeight: '1.6',
                color: 'var(--alt-text)'
              }}>
                Get started by selecting data sources from the sidebar to visualize your data.
              </p>
              <button
                onClick={() => setIsOpen(true)}
                style={{
                  padding: '16px 32px',
                  fontSize: '1.2rem',
                  backgroundColor: 'var(--primary)',
                  color: 'var(--text-colour)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontWeight: '500'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--accent)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
              >
                Edit Graph
              </button>
            </div>
          )}
        </GraphWrapper>
      }
      sidebarContent={
        <EditSidebar 
          sources={sources}
          onSourcesUpdate={handleSourcesUpdate}
        />
      }
    />
  );
};