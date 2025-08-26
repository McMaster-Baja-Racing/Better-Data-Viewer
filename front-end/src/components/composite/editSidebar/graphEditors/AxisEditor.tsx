import { Accordion } from '@components/ui/accordion/Accordion';
import styles from './GeneralStyles.module.scss';
import { useChartOptions } from '@contexts/ChartOptionsContext';
import { OptionSquare } from '@components/ui/optionSquare/optionSquare';
import { settingsIcon } from '@assets/icons';
import { Slider } from '@components/ui/slider/Slider';
import { NumberInput } from '@components/ui/numberInput/NumberInput';

export const AxisEditor = () => {
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