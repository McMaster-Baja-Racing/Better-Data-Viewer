import { Accordion } from '@components/ui/accordion/Accordion';
import { Dropdown } from '@components/ui/dropdown/Dropdown';
import { OptionSquare } from '@components/ui/optionSquare/optionSquare';
import styles from './GraphEditors.module.scss';
import { useChartOptions } from '@contexts/ChartOptionsContext';
import { settingsIcon } from '@assets/icons';

export const LegendEditor = () => {
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