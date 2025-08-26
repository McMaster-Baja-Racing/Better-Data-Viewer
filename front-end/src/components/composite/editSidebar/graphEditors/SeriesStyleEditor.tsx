import { checkMarkIcon } from '@assets/icons';
import { Accordion } from '@components/ui/accordion/Accordion';
import { OptionSquare } from '@components/ui/optionSquare/optionSquare';
import { Slider } from '@components/ui/slider/Slider';
import { useChartOptions } from '@contexts/ChartOptionsContext';

export const SeriesStyleEditor = () => {
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