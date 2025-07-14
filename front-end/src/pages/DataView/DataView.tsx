import { ChartInformation, dataColumnKeys } from '@types';
import Chart from '@components/legacy/views/Chart/Chart';
import { GraphWrapper } from '@components/simple/graphWrapper/GraphWrapper';
import { RightSidebar } from '@components/ui/rightSidebar/RightSidebar';
import { useLocation } from 'react-router-dom';
import { useEffect, useMemo, useReducer, useState } from 'react';
import { chartInformationReducer } from '@lib/chartInformation';
import { EditSidebar } from '@components/composite/editSidebar/EditSidebar';
import { ChartProvider, useChart } from '../../ChartContext';

export const DataView = () => {
  const location = useLocation();
  const { chartInformation } = (location.state || {}) as { chartInformation: ChartInformation };

  // Store the chart information in state so it doesn't update on every render.
  const [chartDataState, dispatch] = useReducer(chartInformationReducer, chartInformation);
  const [bins, setBins] = useState<string[]>([]); // TODO: Expand past bins
  const [isOpen, setIsOpen] = useState(false);


  useEffect(() => {
    const tempBins = chartDataState.files.map((file) =>
      dataColumnKeys
        .map((key) => file[key]?.filename)
        .filter((fn): fn is string => !!fn)
        .map((filename) => filename.split('/')[0])
    );
    const uniqueBins = [...new Set(tempBins.flat())];
    setBins(uniqueBins);
  }, [chartDataState]);

  // Memoize the video object to prevent re-creation on every render.
  const video = useMemo(() => ({
    key: '',
    start: new Date(),
    end: new Date()
  }), []);

  if (!chartDataState || bins.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    // TODO: Extract this title better
    <ChartProvider>
      <RightSidebar 
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        mainContent={
          <GraphWrapper 
            title={chartDataState.files[0].y.header + ' vs ' + chartDataState.files[0].x.header}
            editOnClick={() => setIsOpen(!isOpen)}
          >
            <Chart 
              chartInformation={chartDataState}
              video={video}
              videoTimestamp={0}
            />
              
          </GraphWrapper>
        }
        sidebarContent={
          <EditSidebar 
            chartInfo={chartDataState} 
            chartInfoDispatch={dispatch}
            files={bins}
          />
        }
      />
    </ChartProvider>
  );
};