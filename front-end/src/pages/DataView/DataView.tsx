import { useState } from 'react';
import { useDashboard } from '@contexts/DashboardContext';
import { ChartOptionsRegistryProvider } from '@contexts/ChartOptionsContext';
import { ChartQueryRegistryProvider } from '@contexts/ChartQueryContext';
import { MultiGraphView } from './MultiGraphView';
import { SingleGraphView } from './SingleGraphView';
import { GraphControls } from '@components/simple/graphControls/graphControls';
import styles from './DataView.module.scss';

export const DataView = () => {
  const { focusedId, charts } = useDashboard();
  const [isEditMode, setIsEditMode] = useState(false);

  return (
    <ChartOptionsRegistryProvider>
      <ChartQueryRegistryProvider>
        <div className={styles.dataView}>
          {focusedId ? (
            <SingleGraphView 
              chartId={focusedId} 
              onEditModeChange={setIsEditMode}
            />
          ) : (
            <MultiGraphView onEditModeChange={setIsEditMode} />
          )}
          {!focusedId && !isEditMode && (
            <GraphControls />
          )}
        </div>
      </ChartQueryRegistryProvider>
    </ChartOptionsRegistryProvider>
  );
};