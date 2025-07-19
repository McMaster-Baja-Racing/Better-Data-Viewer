import { dataColumnKeys } from '@types';
import Chart from '@components/legacy/views/Chart/Chart';
import { GraphWrapper } from '@components/simple/graphWrapper/GraphWrapper';
import { RightSidebar } from '@components/ui/rightSidebar/RightSidebar';
import { useEffect, useState } from 'react';
import { EditSidebar } from '@components/composite/editSidebar/EditSidebar';
import { ChartOptionsProvider } from '../../ChartOptionsContext';
import { DashboardProvider } from '../../DashboardContext';
import { useChartQuery } from '../../ChartQueryContext';

export const DataView = () => {
  const { series } = useChartQuery();
  const [bins, setBins] = useState<string[]>([]); // TODO: Expand past bins
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const tempBins = series.map((file) =>
      dataColumnKeys
        .map((key) => file[key]?.source)
        .filter((fn): fn is string => !!fn)
        .map((filename) => filename.split('/')[0])
    );
    const uniqueBins = [...new Set(tempBins.flat())];
    setBins(uniqueBins);
  }, [series]);

  if (!series || bins.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    // TODO: Extract this title better
    <ChartOptionsProvider>
      <DashboardProvider>
        <RightSidebar
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          mainContent={
            <GraphWrapper 
              editOnClick={() => setIsOpen(!isOpen)}
            >
              <Chart
                video={null}
                videoTimestamp={0}
              />
            </GraphWrapper>
          }
          sidebarContent={
            <EditSidebar 
              sources={bins}
            />
          }
        />
      </DashboardProvider>
    </ChartOptionsProvider>
  );
};