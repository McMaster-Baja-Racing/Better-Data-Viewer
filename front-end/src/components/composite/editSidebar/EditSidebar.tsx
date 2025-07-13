import { ChartAction } from '@lib/chartInformation';
import { ChartInformation, dataTypesArray, chartType as chartTypeEnum } from '@types';
import styles from './EditSidebar.module.scss';
import { DataSelect } from '../dataSelect/dataSelect';
import { Dropdown } from '@components/ui/dropdown/Dropdown';
import { useEffect, useState } from 'react';


interface EditSidebarProps {
  chartInfo: ChartInformation;
  dispatch: React.Dispatch<ChartAction>;
  files: string[]; // TODO: This should use the file type specified in the file browser
}

export const EditSidebar = ({ chartInfo, dispatch, files }: EditSidebarProps) => {
  const [chartType, setChartType] = useState(chartInfo.type);

  useEffect(() => {
    dispatch({ type: 'UPDATE_GRAPHING_TYPE', updatedType: chartType });
  }, [chartType, dispatch]);


  return (
    <>
      <div>
        Chart type
      </div>
      <Dropdown 
        options={Object.values(chartTypeEnum).map((type) => ({ value: type, label: type }))}
        selected={chartType}
        setSelected={setChartType}
      />
      {chartInfo.files.map((file, fileIndex) => {
        return (
          <div key={fileIndex}>
            <div className={styles.title}>
                  Pick your data (Y-Axis)
            </div>
            <DataSelect
              sources={files.map((file) => ({ value: file, label: file }))}
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
              sources={files.map((file) => ({ value: file, label: file }))}
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
  );
};