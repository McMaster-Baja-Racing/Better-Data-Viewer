import { getDataTypes, chartTypeMap, ChartType } from '@types';
import { useFiles } from '@lib/files/useFiles';
import { DataSelect } from '../dataSelect/dataSelect';
import { Dropdown } from '@components/ui/dropdown/Dropdown';
import { useEffect, useState } from 'react';
import { useChartOptions } from '@contexts/ChartOptionsContext';
import { useChartQuery } from '@contexts/ChartQueryContext';
import { plusIcon, trashIcon } from '@assets/icons';
import { TitleEditor } from './graphEditors/TitleEditor';
import { LegendEditor } from './graphEditors/LegendEditor';
import { AxisEditor } from './graphEditors/AxisEditor';
import { GridEditor } from './graphEditors/GridEditor';
import { InteractionEditor } from './graphEditors/InteractionEditor';
import { AppearanceEditor } from './graphEditors/AppearanceEditor';
import { SeriesStyleEditor } from './graphEditors/SeriesStyleEditor';
import styles from './EditSidebar.module.scss';

interface EditSidebarProps {
  sources: string[]; // TODO: This should use the file type specified in the file browser
}

export const EditSidebar = ({ sources }: EditSidebarProps) => {
  const { options, dispatch: chartOptionsDispatch } = useChartOptions();
  const { series, dispatch: chartQueryDispatch } = useChartQuery();
  const [chartType, setChartType] = useState<ChartType>(options.series?.[0]?.type ?? 'line');
  
  const { data: files, dataTypeMap } = useFiles();

  // Create an initial empty series if none exist
  useEffect(() => {
    if (series.length === 0) {
      const initialSeries = {
        x: { source: '', dataType: '' },
        y: { source: '', dataType: '' },
        analyzer: { type: null, options: [] }
      };
      chartQueryDispatch({ type: 'ADD_SERIES', series: initialSeries });
    }
  }, [series.length, chartQueryDispatch]);

  useEffect(() => {
    chartOptionsDispatch({ type: 'SET_CHART_TYPE', chartType: chartType });
  }, [chartType]);

  const addNewSeries = () => {
    // Create an empty series that won't trigger requests until configured
    // Auto-populate x values from the first series if available
    const firstSeriesX = series.length > 0 ? series[0].x : { source: '', dataType: '' };
    
    const newSeries = {
      x: { source: firstSeriesX.source, dataType: firstSeriesX.dataType },
      y: { source: '', dataType: '' },
      analyzer: { type: null, options: [] }
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

      <div className={styles.section}>
        <div className={styles.title}>
          X-Axis
        </div>
        {series.length > 0 && series[0] && <DataSelect
          sources={sources.map((file) => ({ value: file, label: file }))}
          dataTypes={(dataTypeMap.get(series[0]?.x?.source) || []).map((dataType) => ({ value: dataType, label: dataType }))}
          columnKey='x'
          seriesIndex={0}
          onColumnUpdate={(_, updatedColumn) => chartQueryDispatch({ 
            type: 'UPDATE_X_COLUMN_ALL', 
            xColumn: {dataType: updatedColumn.dataType, source: updatedColumn.source}
          })}
          onAnalyzerUpdate={(newAnalyzerType, newAnalyzerValues) => {
            chartQueryDispatch({
              type: 'UPDATE_ANALYZER_ALL',
              analyzer: {
                type: newAnalyzerType,
                options: newAnalyzerValues || []
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
              dataTypes={(dataTypeMap.get(series[fileIndex]?.y?.source) || []).map((dataType) => ({ value: dataType, label: dataType }))}
              key={fileIndex + 'y'}
              columnKey='y'
              seriesIndex={fileIndex}
              onColumnUpdate={(column, updatedColumn) => {
                // Auto-populate source from x-axis if not set
                const finalColumn = {
                  ...updatedColumn,
                  source: updatedColumn.source || series[0]?.x?.source || ''
                };
                chartQueryDispatch(
                  { type: 'UPDATE_COLUMN', index: fileIndex, columnKey: column, column: finalColumn }
                );
              }}
              onAnalyzerUpdate={(newAnalyzerType, newAnalyzerValues) => chartQueryDispatch({ 
                type: 'UPDATE_ANALYZER', 
                index: fileIndex, 
                analyzer: {type: newAnalyzerType, options: newAnalyzerValues || []}
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
        <AxisEditor />
        <GridEditor />
        <InteractionEditor />
        <AppearanceEditor />
        <SeriesStyleEditor />
      </div>
    </div>
  );
};
