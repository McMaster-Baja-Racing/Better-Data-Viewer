import { dataTypesArray, chartTypeMap, ChartType } from '@types';
import styles from './EditSidebar.module.scss';
import { DataSelect } from '../dataSelect/dataSelect';
import { Dropdown } from '@components/ui/dropdown/Dropdown';
import { useEffect, useState } from 'react';
import { useChartOptions, getAxisTitle } from '@contexts/ChartOptionsContext';
import TextField from '@components/ui/textfield/TextField';
import { OptionSquare } from '@components/ui/optionSquare/optionSquare';
import { Slider } from '@components/ui/slider/Slider';
import { ColorPicker } from '@components/ui/colorPicker/ColorPicker';
import { NumberInput } from '@components/ui/numberInput/NumberInput';
import { useDashboard } from '@contexts/DashboardContext';
import { useChartQuery } from '@contexts/ChartQueryContext';
import { Accordion } from '@components/ui/accordion/Accordion';
import { plusIcon, trashIcon, settingsIcon, checkMarkIcon } from '@assets/icons';

interface EditSidebarProps {
  sources: string[]; // TODO: This should use the file type specified in the file browser
}

export const EditSidebar = ({ sources }: EditSidebarProps) => {
  const { options, dispatch: chartOptionsDispatch } = useChartOptions();
  const { series, dispatch: chartQueryDispatch } = useChartQuery();
  const [chartType, setChartType] = useState<ChartType>(options.series?.[0]?.type ?? 'line');

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
          dataTypes={dataTypesArray.map((dataType) => ({ value: dataType, label: dataType }))}
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
              dataTypes={dataTypesArray.map((dataType) => ({ value: dataType, label: dataType }))}
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

  const legendPositions = [
    { value: 'top', label: 'Top' },
    { value: 'bottom', label: 'Bottom' },
    { value: 'left', label: 'Left' },
    { value: 'right', label: 'Right' }
  ];

  const alignmentOptions = [
    { value: 'left' as const, label: 'Left' },
    { value: 'center' as const, label: 'Center' },
    { value: 'right' as const, label: 'Right' }
  ];

  return (
    <Accordion title={'Legend Options'}>
      <OptionSquare
        label={'Show Legend'}
        illustration={settingsIcon}
        clicked={options.legend?.enabled || false}
        setClicked={() => chartOptionsDispatch({ type: 'TOGGLE_LEGEND' })}
      />
      
      <div className={styles.row}>
        <div className={styles.column}>
          <label className={styles.label}>Position</label>
          <Dropdown
            options={legendPositions}
            selected={
              options.legend?.verticalAlign === 'top' ? 'top' :
                options.legend?.verticalAlign === 'bottom' ? 'bottom' :
                  options.legend?.align === 'left' ? 'left' :
                    options.legend?.align === 'right' ? 'right' : 'bottom'
            }
            setSelected={(position) => chartOptionsDispatch({ 
              type: 'SET_LEGEND_POSITION', 
              position: position as 'top' | 'bottom' | 'left' | 'right'
            })}
          />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.column}>
          <label className={styles.label}>Alignment</label>
          <Dropdown
            options={alignmentOptions}
            selected={options.legend?.align || 'center'}
            setSelected={(align) => chartOptionsDispatch({ 
              type: 'SET_LEGEND_ALIGN', 
              align: align as 'left' | 'center' | 'right'
            })}
          />
        </div>
      </div>
    </Accordion>
  );
};

const AxisEditor = () => {
  const { options, dispatch: chartOptionsDispatch } = useChartOptions();

  const getAxisOptions = (axis: 'xAxis' | 'yAxis') => {
    const axisObj = options[axis];
    if (Array.isArray(axisObj)) {
      return axisObj[0] || {};
    }
    return axisObj || {};
  };

  return (
    <Accordion title={'Axis Options'}>
      <h4 className={styles.subTitle}>X-Axis</h4>
      
      <OptionSquare
        label={'Show Labels'}
        illustration={settingsIcon}
        clicked={getAxisOptions('xAxis').labels?.enabled !== false}
        setClicked={() => chartOptionsDispatch({ type: 'TOGGLE_AXIS_LABELS', axis: 'xAxis' })}
      />

      <OptionSquare
        label={'Opposite Side'}
        illustration={settingsIcon}
        clicked={getAxisOptions('xAxis').opposite || false}
        setClicked={() => chartOptionsDispatch({ type: 'TOGGLE_AXIS_OPPOSITE', axis: 'xAxis' })}
      />

      <OptionSquare
        label={'Show Crosshair'}
        illustration={settingsIcon}
        clicked={!!getAxisOptions('xAxis').crosshair}
        setClicked={() => chartOptionsDispatch({ type: 'TOGGLE_CROSSHAIR', axis: 'xAxis' })}
      />

      <Slider
        label="Label Rotation"
        value={getAxisOptions('xAxis').labels?.rotation || 0}
        min={-90}
        max={90}
        step={15}
        unit="°"
        onChange={(rotation) => chartOptionsDispatch({ 
          type: 'SET_AXIS_LABEL_ROTATION', 
          axis: 'xAxis', 
          rotation 
        })}
      />

      <div className={styles.row}>
        <div className={styles.column}>
          <NumberInput
            label="Min Value"
            value={getAxisOptions('xAxis').min || undefined}
            onChange={(min) => chartOptionsDispatch({ 
              type: 'SET_AXIS_MIN_MAX', 
              axis: 'xAxis', 
              min 
            })}
            placeholder="Auto"
          />
        </div>
        <div className={styles.column}>
          <NumberInput
            label="Max Value"
            value={getAxisOptions('xAxis').max || undefined}
            onChange={(max) => chartOptionsDispatch({ 
              type: 'SET_AXIS_MIN_MAX', 
              axis: 'xAxis', 
              max 
            })}
            placeholder="Auto"
          />
        </div>
      </div>

      <h4 className={styles.subTitle}>Y-Axis</h4>
      
      <OptionSquare
        label={'Show Labels'}
        illustration={settingsIcon}
        clicked={getAxisOptions('yAxis').labels?.enabled !== false}
        setClicked={() => chartOptionsDispatch({ type: 'TOGGLE_AXIS_LABELS', axis: 'yAxis' })}
      />

      <OptionSquare
        label={'Opposite Side'}
        illustration={settingsIcon}
        clicked={getAxisOptions('yAxis').opposite || false}
        setClicked={() => chartOptionsDispatch({ type: 'TOGGLE_AXIS_OPPOSITE', axis: 'yAxis' })}
      />

      <OptionSquare
        label={'Show Crosshair'}
        illustration={settingsIcon}
        clicked={!!getAxisOptions('yAxis').crosshair}
        setClicked={() => chartOptionsDispatch({ type: 'TOGGLE_CROSSHAIR', axis: 'yAxis' })}
      />

      <Slider
        label="Label Rotation"
        value={getAxisOptions('yAxis').labels?.rotation || 0}
        min={-90}
        max={90}
        step={15}
        unit="°"
        onChange={(rotation) => chartOptionsDispatch({ 
          type: 'SET_AXIS_LABEL_ROTATION', 
          axis: 'yAxis', 
          rotation 
        })}
      />

      <div className={styles.row}>
        <div className={styles.column}>
          <NumberInput
            label="Min Value"
            value={getAxisOptions('yAxis').min || undefined}
            onChange={(min) => chartOptionsDispatch({ 
              type: 'SET_AXIS_MIN_MAX', 
              axis: 'yAxis', 
              min 
            })}
            placeholder="Auto"
          />
        </div>
        <div className={styles.column}>
          <NumberInput
            label="Max Value"
            value={getAxisOptions('yAxis').max || undefined}
            onChange={(max) => chartOptionsDispatch({ 
              type: 'SET_AXIS_MIN_MAX', 
              axis: 'yAxis', 
              max 
            })}
            placeholder="Auto"
          />
        </div>
      </div>
    </Accordion>
  );
};

const GridEditor = () => {
  const { options, dispatch: chartOptionsDispatch } = useChartOptions();

  const getAxisOptions = (axis: 'xAxis' | 'yAxis') => {
    const axisObj = options[axis];
    if (Array.isArray(axisObj)) {
      return axisObj[0] || {};
    }
    return axisObj || {};
  };

  return (
    <Accordion title={'Grid Options'}>
      <h4 className={styles.subTitle}>X-Axis Grid</h4>
      
      <OptionSquare
        label={'Show Grid Lines'}
        illustration={settingsIcon}
        clicked={(getAxisOptions('xAxis').gridLineWidth || 0) > 0}
        setClicked={() => chartOptionsDispatch({ type: 'TOGGLE_GRID_LINES', axis: 'xAxis' })}
      />

      <OptionSquare
        label={'Show Minor Grid'}
        illustration={settingsIcon}
        clicked={(getAxisOptions('xAxis').minorGridLineWidth || 0) > 0}
        setClicked={() => chartOptionsDispatch({ type: 'TOGGLE_MINOR_GRID_LINES', axis: 'xAxis' })}
      />

      <ColorPicker
        label="Grid Line Color"
        value={String(getAxisOptions('xAxis').gridLineColor || '#666666')}
        onChange={(color) => chartOptionsDispatch({ 
          type: 'SET_GRID_LINE_COLOR', 
          axis: 'xAxis', 
          color 
        })}
      />

      <h4 className={styles.subTitle}>Y-Axis Grid</h4>
      
      <OptionSquare
        label={'Show Grid Lines'}
        illustration={settingsIcon}
        clicked={(getAxisOptions('yAxis').gridLineWidth || 0) > 0}
        setClicked={() => chartOptionsDispatch({ type: 'TOGGLE_GRID_LINES', axis: 'yAxis' })}
      />

      <OptionSquare
        label={'Show Minor Grid'}
        illustration={settingsIcon}
        clicked={(getAxisOptions('yAxis').minorGridLineWidth || 0) > 0}
        setClicked={() => chartOptionsDispatch({ type: 'TOGGLE_MINOR_GRID_LINES', axis: 'yAxis' })}
      />

      <ColorPicker
        label="Grid Line Color"
        value={String(getAxisOptions('yAxis').gridLineColor || '#666666')}
        onChange={(color) => chartOptionsDispatch({ 
          type: 'SET_GRID_LINE_COLOR', 
          axis: 'yAxis', 
          color 
        })}
      />
    </Accordion>
  );
};

const InteractionEditor = () => {
  const { options, dispatch: chartOptionsDispatch } = useChartOptions();

  const zoomTypeOptions = [
    { value: 'x' as const, label: 'Horizontal' },
    { value: 'y' as const, label: 'Vertical' },
    { value: 'xy' as const, label: 'Both' }
  ];

  const zoomObject = options.chart?.zooming;
  const isZoomEnabled = !!(zoomObject && zoomObject.type);
  const currentZoomType = zoomObject?.type || 'x';

  return (
    <Accordion title={'Interaction Options'}>
      <OptionSquare
        label={'Enable Zoom'}
        illustration={settingsIcon}
        clicked={isZoomEnabled}
        setClicked={(enabled) => chartOptionsDispatch({ type: 'TOGGLE_ZOOM', enabled })}
      />

      {isZoomEnabled && (
        <div className={styles.row}>
          <div className={styles.column}>
            <label className={styles.label}>Zoom Direction</label>
            <Dropdown
              options={zoomTypeOptions}
              selected={currentZoomType}
              setSelected={(zoomType) => chartOptionsDispatch({ 
                type: 'SET_ZOOM_TYPE', 
                zoomType: zoomType as 'x' | 'y' | 'xy'
              })}
            />
          </div>
        </div>
      )}

      <OptionSquare
        label={'Show Tooltip'}
        illustration={settingsIcon}
        clicked={options.tooltip?.enabled !== false}
        setClicked={() => chartOptionsDispatch({ type: 'TOGGLE_TOOLTIP' })}
      />

      <OptionSquare
        label={'Enable Animation'}
        illustration={settingsIcon}
        clicked={options.chart?.animation !== false}
        setClicked={() => chartOptionsDispatch({ type: 'TOGGLE_ANIMATION' })}
      />
    </Accordion>
  );
};

const AppearanceEditor = () => {
  const { options, dispatch: chartOptionsDispatch } = useChartOptions();

  return (
    <Accordion title={'Appearance Options'}>
      <ColorPicker
        label="Background Color"
        value={options.chart?.backgroundColor as string || '#222222'}
        onChange={(color) => chartOptionsDispatch({ 
          type: 'SET_BACKGROUND_COLOR', 
          color 
        })}
      />

      <ColorPicker
        label="Plot Area Color"
        value={options.chart?.plotBackgroundColor as string || 'transparent'}
        onChange={(color) => chartOptionsDispatch({ 
          type: 'SET_PLOT_BACKGROUND_COLOR', 
          color 
        })}
        presetColors={[
          'transparent', '#111111', '#222222', '#333333', '#444444', '#555555', '#666666',
          '#f0f0f0', '#e0e0e0', '#d0d0d0', '#c0c0c0', '#b0b0b0', '#a0a0a0', '#ffffff'
        ]}
      />
    </Accordion>
  );
};

const SeriesStyleEditor = () => {
  const { options, dispatch: chartOptionsDispatch } = useChartOptions();
  
  const getSeriesOptions = () => {
    const firstSeries = options.series?.[0];
    return firstSeries || {};
  };

  // Type-safe helper to get series properties
  const getLineWidth = (): number => {
    const series = getSeriesOptions() as { lineWidth?: number };
    return series.lineWidth || 2;
  };

  const getMarkerEnabled = (): boolean => {
    const series = getSeriesOptions() as { marker?: { enabled?: boolean } };
    return series.marker?.enabled !== false;
  };

  const getMarkerSize = (): number => {
    const series = getSeriesOptions() as { marker?: { radius?: number } };
    return series.marker?.radius || 4;
  };

  return (
    <Accordion title={'Series Style Options'}>
      <Slider
        label="Line Width"
        value={getLineWidth()}
        min={0.5}
        max={10}
        step={0.5}
        unit="px"
        onChange={(width) => chartOptionsDispatch({ 
          type: 'SET_SERIES_LINE_WIDTH', 
          width 
        })}
      />

      <OptionSquare
        label={'Show Markers'}
        illustration={checkMarkIcon}
        clicked={getMarkerEnabled()}
        setClicked={() => chartOptionsDispatch({ type: 'TOGGLE_SERIES_MARKERS' })}
      />

      <Slider
        label="Marker Size"
        value={getMarkerSize()}
        min={1}
        max={15}
        step={1}
        unit="px"
        onChange={(size) => chartOptionsDispatch({ 
          type: 'SET_SERIES_MARKER_SIZE', 
          size 
        })}
      />
    </Accordion>
  );
};