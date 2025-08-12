import { dataTypesArray, chartTypeMap, ChartType, AnalyzerType } from '@types';
import styles from './EditSidebar.module.scss';
import { DataSelect } from '../dataSelect/dataSelect';
import { Dropdown } from '@components/ui/dropdown/Dropdown';
import { useEffect, useState } from 'react';
import { useChartOptions, getAxisTitle } from '@contexts/ChartOptionsContext';
import TextField from '@components/ui/textfield/TextField';
import { OptionSquare } from '@components/ui/optionSquare/optionSquare';
import { useDashboard } from '@contexts/DashboardContext';
import { useChartQuery } from '@contexts/ChartQueryContext';
import { Accordion } from '@components/ui/accordion/Accordion';
import { plusIcon, trashIcon } from '@assets/icons';

interface EditSidebarProps {
  sources: string[]; // TODO: This should use the file type specified in the file browser
}

export const EditSidebar = ({ sources }: EditSidebarProps) => {
  const { options, dispatch: chartOptionsDispatch } = useChartOptions();
  const { series, dispatch: chartQueryDispatch } = useChartQuery();
  const [chartType, setChartType] = useState<ChartType>(options.series?.[0]?.type || 'line');

  useEffect(() => {
    chartOptionsDispatch({ type: 'SET_CHART_TYPE', chartType: chartType });
  }, [chartType]);

  const addNewSeries = () => {
    // Use the first available source, or empty string if none available
    const defaultSource = sources.length > 0 ? sources[0] : '';
    
    // Use sensible defaults for data types
    const defaultXDataType = 'Timestamp (ms)';
    const defaultYDataType = dataTypesArray.find(dt => dt !== defaultXDataType) || 'GPS Speed (m/s)';
    
    const newSeries = {
      x: { source: defaultSource, dataType: defaultXDataType },
      y: { source: defaultSource, dataType: defaultYDataType },
      analyzer: { type: AnalyzerType.INTERPOLATER_PRO, options: [] }
    };
    chartQueryDispatch({ type: 'ADD_SERIES', series: newSeries });
  };

  const removeSeries = (index: number) => {
    // Prevent removing the last series
    if (series.length > 1) {
      chartQueryDispatch({ type: 'REMOVE_SERIES', index });
    }
  };

  return (
    <div className={styles.editSidebar}>
      
      <div className={styles.chartType}>
        <div className={styles.title}>
          Chart type
        </div>
        <Dropdown 
          options={chartTypeMap}
          selected={chartType}
          setSelected={setChartType}
        />
      </div>

      <div>
        <div className={styles.title}>
          X-Axis
        </div>
        {series[0] && <DataSelect
          sources={sources.map((file) => ({ value: file, label: file }))}
          dataTypes={dataTypesArray.map((dataType) => ({ value: dataType, label: dataType }))}
          columnKey='x'
          onColumnUpdate={(_, updatedColumn) => chartQueryDispatch({ 
            type: 'UPDATE_X_COLUMN_ALL', 
            xColumn: {dataType: updatedColumn.dataType, source: updatedColumn.source}
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
      </div>

      {series.map((file, fileIndex) => {
        return (
          <div key={fileIndex} className={styles.seriesContainer}>
            <div className={styles.seriesHeader}>
              <div className={styles.title}>
                Series {fileIndex + 1}
              </div>
              {series.length > 1 && (
                <button 
                  className={styles.removeSeriesButton}
                  onClick={() => removeSeries(fileIndex)}
                  title="Remove Series"
                >
                  <img src={trashIcon} alt="Remove Series" className={styles.removeSeriesIcon} />
                </button>
              )}
            </div>
            <DataSelect
              sources={sources.map((file) => ({ value: file, label: file }))}
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

      <div className={styles.addSeriesContainer}>
        <button className={styles.addSeriesButton} onClick={addNewSeries}>
          <img src={plusIcon} alt="Add Series" className={styles.addSeriesIcon} />
          <span>Add Series</span>
        </button>
      </div>

      <div className={styles.options}>
        <div className={styles.title}>
          Options
        </div>

        <TitleEditor />
        <LegendEditor />
      </div>
    </div>
  );
};

const TitleEditor = () => {
  const { title, dispatch: dashboardDispatch } = useDashboard();
  const { options, dispatch: chartOptionsDispatch } = useChartOptions();

  return (
    <Accordion title={'Title Options'}>
      <TextField
        title={'Dashboard Title'}
        value={title || ''}
        setValue={(title) => dashboardDispatch({ type: 'SET_TITLE', title: title })}
      />
      <TextField
        title={'Chart Subtitle'}
        value={options.title?.text || ''}
        setValue={(title) => chartOptionsDispatch({ type: 'SET_SUBTITLE', text: title })}
      />
      <TextField
        title={'Chart X-Axis Title'}
        value={getAxisTitle(options.xAxis)}
        setValue={(title) => chartOptionsDispatch({ type: 'SET_AXIS_TITLE', axis: 'xAxis',title: title })}
      />
      <TextField
        title={'Chart Y-Axis Title'}
        value={getAxisTitle(options.yAxis)}
        setValue={(title) => chartOptionsDispatch({ type: 'SET_AXIS_TITLE', axis: 'yAxis', title: title })}
      />
    </Accordion>
  );
};

const LegendEditor = () => {
  const { options, dispatch: chartOptionsDispatch } = useChartOptions();

  return (
    <Accordion title={'Legend Options'}>
      <OptionSquare
        label={'Show Legend'}
        illustration='showLegend'
        clicked={options.legend?.enabled || false}
        setClicked={() => chartOptionsDispatch({ type: 'TOGGLE_LEGEND' })}
      />
    </Accordion>
  );

};