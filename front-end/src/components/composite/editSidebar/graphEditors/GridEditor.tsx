import { settingsIcon } from '@assets/icons';
import { Accordion } from '@components/ui/accordion/Accordion';
import { ColorPicker } from '@components/ui/colorPicker/ColorPicker';
import { OptionSquare } from '@components/ui/optionSquare/optionSquare';
import { useChartOptions } from '@contexts/ChartOptionsContext';
import styles from './GraphEditors.module.scss';

export const GridEditor = () => {
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