import { ChartInformation, dataTypesArray, dataColumnKeys } from '@types';
import Chart from '@components/legacy/views/Chart/Chart';
import { GraphWrapper } from '@components/simple/graphWrapper/GraphWrapper';
import { RightSidebar } from '@components/ui/rightSidebar/RightSidebar';
import { useLocation } from 'react-router-dom';
import { useEffect, useMemo, useReducer, useState } from 'react';
import styles from './DataView.module.scss';
import { DataSelect } from '@components/composite/dataSelect/dataSelect';
import { chartInformationReducer } from '@lib/chartInformation';


export const DataView = () => {
  const location = useLocation();
  const { chartInformation } = (location.state || {}) as { chartInformation: ChartInformation };

  // Store the chart information in state so it doesn't update on every render.
  const [chartDataState, dispatch] = useReducer(chartInformationReducer, chartInformation);
  const [bins, setBins] = useState<string[]>([]);
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
    <RightSidebar 
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      mainContent={
        <GraphWrapper title={
          chartDataState.files[0].y.header 
            + ' vs ' 
            + chartDataState.files[0].x.header
        }
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
        <>
          
          {chartDataState.files.map((file, fileIndex) => {
            return (
              <div key={fileIndex}>
                <div className={styles.title}>
                  Pick your data (Y-Axis)
                </div>
                <DataSelect
                  sources={bins.map((bin) => ({ value: bin, label: bin }))}
                  dataTypes={dataTypesArray.map((dataType) => ({ value: dataType, label: dataType }))}
                  key={fileIndex + 'y'}
                  chartFileInformation={file}
                  columnKey="y"
                  onColumnUpdate={(column, updatedColumn) => dispatch(
                    { type: 'UPDATE_COLUMN', fileIndex, column, updatedColumn }
                  )}
                  onAnalyzerUpdate={(newAnalyzerType, newAnalyzerValues) => dispatch({ 
                    type: 'UPDATE_ANALYZER', fileIndex, analyzerType: newAnalyzerType, analyzerValues: newAnalyzerValues
                  })}
                />
                <div className={styles.title}>
                Pick your data (X-Axis)
                </div>
                <DataSelect
                  sources={bins.map((bin) => ({ value: bin, label: bin }))}
                  dataTypes={dataTypesArray.map((dataType) => ({ value: dataType, label: dataType }))}
                  key={fileIndex + 'x'}
                  chartFileInformation={file}
                  columnKey="x"
                  onColumnUpdate={(_, updatedColumn) => dispatch({ type: 'UPDATE_X_COLUMN_ALL', updatedColumn})}
                  onAnalyzerUpdate={(newAnalyzerType, newAnalyzerValues) => dispatch({
                    type: 'UPDATE_ANALYZER', fileIndex, analyzerType: newAnalyzerType, analyzerValues: newAnalyzerValues
                  })}
                />
                <div className={styles.title}>
                Options
                </div>
              </div>
            );
          })}
        </>
        
      }
    />
  );
};