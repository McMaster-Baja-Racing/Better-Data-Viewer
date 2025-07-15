import { ChartAction } from '@lib/chartInformation';
import { ChartInformation, dataTypesArray, chartTypeMap, SeriesType } from '@types';
import styles from './EditSidebar.module.scss';
import { DataSelect } from '../dataSelect/dataSelect';
import { Dropdown } from '@components/ui/dropdown/Dropdown';
import { useEffect, useState } from 'react';
import { useChartOptions } from '../../../ChartOptionsContext';
import TextField from '@components/ui/textfield/TextField';
import { OptionSquare } from '@components/ui/optionSquare/optionSquare';
import { useDashboard } from '../../../DashboardContext';

interface EditSidebarProps {
  chartInfo: ChartInformation;
  chartInfoDispatch: React.Dispatch<ChartAction>;
  files: string[]; // TODO: This should use the file type specified in the file browser
}

export const EditSidebar = ({ chartInfo, chartInfoDispatch, files }: EditSidebarProps) => {
  const { options, dispatch: chartOptionsDispatch } = useChartOptions();
  const { title, dispatch: dashboardDispatch } = useDashboard();
  const [chartType, setChartType] = useState<SeriesType>(options.series?.[0]?.type || 'line');

  useEffect(() => {
    chartOptionsDispatch({ type: 'SET_CHART_TYPE', chartType: chartType });
  }, [chartType, chartInfoDispatch]);

  return (
    <div className={styles.editSidebar}>
      <div className={styles.title}>
        Chart type
      </div>
      <Dropdown 
        options={chartTypeMap}
        selected={chartType}
        setSelected={setChartType}
      />

      <div className={styles.title}>
        X-Axis
      </div>
      {chartInfo.files[0] && <DataSelect
        sources={files.map((file) => ({ value: file, label: file }))}
        dataTypes={dataTypesArray.map((dataType) => ({ value: dataType, label: dataType }))}
        chartFileInformation={chartInfo.files[0]}
        columnKey='x'
        onColumnUpdate={(_, updatedColumn) => chartInfoDispatch({ type: 'UPDATE_X_COLUMN_ALL', updatedColumn})}
        onAnalyzerUpdate={(newAnalyzerType, newAnalyzerValues) => {
          chartInfoDispatch({
            type: 'UPDATE_ANALYZER_TYPE_ALL',
            analyzerType: newAnalyzerType ?? null,
            analyzerValues: newAnalyzerValues ?? []
          });
        }}
      />}

      {chartInfo.files.map((file, fileIndex) => {
        return (
          <div key={fileIndex}>
            <div className={styles.title}>
              Series
            </div>
            <DataSelect
              sources={files.map((file) => ({ value: file, label: file }))}
              dataTypes={dataTypesArray.map((dataType) => ({ value: dataType, label: dataType }))}
              key={fileIndex + 'y'}
              chartFileInformation={file}
              columnKey='y'
              onColumnUpdate={(column, updatedColumn) => chartInfoDispatch(
                { type: 'UPDATE_COLUMN', fileIndex, column, updatedColumn }
              )}
              onAnalyzerUpdate={(newAnalyzerType, newAnalyzerValues) => chartInfoDispatch({ 
                type: 'UPDATE_ANALYZER', fileIndex, analyzerType: newAnalyzerType, analyzerValues: newAnalyzerValues
              })}
            />
          </div>
        );
      })}

      <div className={styles.title}>
        Options
      </div>

      <TextField
        title={'coolguy'}
        value={title || ''}
        setValue={(title) => dashboardDispatch({ type: 'SET_TITLE', title: title })}
      />

      <OptionSquare
        label={'Show Legend'}
        illustration='showLegend'
        clicked={options.legend?.enabled || false}
        setClicked={() => chartOptionsDispatch({ type: 'TOGGLE_LEGEND' })}
      />
    </div>
  );
};