import { Accordion } from '@components/ui/accordion/Accordion';
import { ColorPicker } from '@components/ui/colorPicker/ColorPicker';
import { useChartOptions } from '@contexts/ChartOptionsContext';


export const AppearanceEditor = () => {
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
