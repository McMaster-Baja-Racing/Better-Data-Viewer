import { settingsIcon } from '@assets/icons';
import { Accordion } from '@components/ui/accordion/Accordion';
import { Dropdown } from '@components/ui/dropdown/Dropdown';
import { OptionSquare } from '@components/ui/optionSquare/optionSquare';
import { useChartOptions } from '@contexts/ChartOptionsContext';
import styles from './GeneralStyles.module.scss';

export const InteractionEditor = () => {
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