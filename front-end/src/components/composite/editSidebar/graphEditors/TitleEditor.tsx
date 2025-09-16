import { Accordion } from '@components/ui/accordion/Accordion';
import TextField from '@components/ui/textfield/TextField';
import { getAxisTitle, useChartOptions } from '@contexts/ChartOptionsContext';
import { useDashboard } from '@contexts/DashboardContext';

export const TitleEditor = () => {
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
        value={options.subtitle?.text || ''}
        setValue={(subtitle) => chartOptionsDispatch({ type: 'SET_SUBTITLE', text: subtitle })}
      />
      <TextField
        title={'Chart X-Axis Title'}
        value={getAxisTitle(options.xAxis)}
        setValue={(title) => chartOptionsDispatch({ type: 'SET_AXIS_TITLE', axis: 'xAxis', title: title })}
      />
      <TextField
        title={'Chart Y-Axis Title'}
        value={getAxisTitle(options.yAxis)}
        setValue={(title) => chartOptionsDispatch({ type: 'SET_AXIS_TITLE', axis: 'yAxis', title: title })}
      />
    </Accordion>
  );
};