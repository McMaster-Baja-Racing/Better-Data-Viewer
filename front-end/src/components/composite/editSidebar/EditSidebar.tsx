import { dataTypesArray, chartTypeMap, SeriesType } from '@types';
import styles from './EditSidebar.module.scss';
import { DataSelect } from '../dataSelect/dataSelect';
import { Dropdown } from '@components/ui/dropdown/Dropdown';
import { useEffect, useState } from 'react';
import { useChartOptions } from '../../../ChartOptionsContext';
import TextField from '@components/ui/textfield/TextField';
import { OptionSquare } from '@components/ui/optionSquare/optionSquare';
import { useDashboard } from '../../../DashboardContext';
import { useChartQuery } from '../../../ChartQueryContext';

interface EditSidebarProps {
  files: string[]; // TODO: This should use the file type specified in the file browser
}

export const EditSidebar = ({ files }: EditSidebarProps) => {
  const { options, dispatch: chartOptionsDispatch } = useChartOptions();
  const { title, dispatch: dashboardDispatch } = useDashboard();
  const { series, dispatch: chartQueryDispatch } = useChartQuery();
  const [chartType, setChartType] = useState<SeriesType>(options.series?.[0]?.type || 'line');

  useEffect(() => {
    chartOptionsDispatch({ type: 'SET_CHART_TYPE', chartType: chartType });
  }, [chartType]);

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
      {series[0] && <DataSelect
        sources={files.map((file) => ({ value: file, label: file }))}
        dataTypes={dataTypesArray.map((dataType) => ({ value: dataType, label: dataType }))}
        columnKey='x'
        onColumnUpdate={(_, updatedColumn) => chartQueryDispatch({ 
          type: 'UPDATE_X_COLUMN_ALL', 
          xColumn: {header: updatedColumn.header, filename: updatedColumn.filename}
        })}
        onAnalyzerUpdate={(newAnalyzerType, newAnalyzerValues) => {
          chartQueryDispatch({
            type: 'UPDATE_ANALYZER_ALL',
            analyzer: {
              type: newAnalyzerType,
              options: newAnalyzerValues
            }
          });
        }}
      />}

      {series.map((file, fileIndex) => {
        return (
          <div key={fileIndex}>
            <div className={styles.title}>
              Series
            </div>
            <DataSelect
              sources={files.map((file) => ({ value: file, label: file }))}
              dataTypes={dataTypesArray.map((dataType) => ({ value: dataType, label: dataType }))}
              key={fileIndex + 'y'}
              columnKey='y'
              onColumnUpdate={(column, updatedColumn) => chartQueryDispatch(
                { type: 'UPDATE_COLUMN', index: fileIndex, columnKey: column, column: updatedColumn  }
              )}
              onAnalyzerUpdate={(newAnalyzerType, newAnalyzerValues) => chartQueryDispatch({ 
                type: 'UPDATE_ANALYZER', 
                index: fileIndex, 
                analyzer: {type: newAnalyzerType, options: newAnalyzerValues}
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