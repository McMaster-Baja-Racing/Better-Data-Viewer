import React, { createContext, useReducer, useContext } from 'react';
import { Options, SeriesOptionsType } from 'highcharts';
import { defaultChartOptions } from '@lib/chartOptions';
import isEqual from 'lodash.isequal';

type ChartOptionsAction =
  | { type: 'SET_SUBTITLE'; text: string }
  | { type: 'TOGGLE_LEGEND' }
  | { type: 'REPLACE_OPTIONS'; options: Options }
  | { type: 'CLEAR_SERIES'}
  | { type: 'ADD_SERIES'; series: SeriesOptionsType }
  | { type: 'SET_AXIS_TITLE'; axis: 'xAxis' | 'yAxis'; title: string }
  | { type: 'SET_CHART_TYPE'; chartType: SeriesOptionsType['type'] | 'coloredLine' };

const ChartOptionsContext = createContext<{
  options: Options;
  dispatch: React.Dispatch<ChartOptionsAction>;
} | undefined>(undefined);

const chartOptionsReducer = (state: Options, action: ChartOptionsAction): Options => {
  console.log('ChartOptionsReducer called with action:', action);
  let updatedState: Options = state;

  switch (action.type) {
    case 'SET_SUBTITLE':
      updatedState = {
        ...state,
        subtitle: { ...state.subtitle, text: action.text },
      };
      break;
    case 'TOGGLE_LEGEND':
      updatedState = {
        ...state,
        legend: {
          ...state.legend,
          enabled: !state.legend?.enabled,
        },
      };
      break;
    case 'REPLACE_OPTIONS':
      updatedState = action.options;
      break;
    case 'CLEAR_SERIES':
      updatedState = {
        ...state,
        series: []
      };
      break;
    case 'ADD_SERIES':
      updatedState = {
        ...state,
        series: [...(state.series || []), action.series]
      };
      break;
    case 'SET_AXIS_TITLE':
      updatedState = {
        ...state,
        [action.axis]: {
          ...state[action.axis],
          title: {
            ...state[action.axis]?.title,
            text: action.title,
          },
        },
      };
      break;
    case 'SET_CHART_TYPE':
      updatedState = {
        ...state,
        series: (state.series || [])
          .map(s => ({ ...s, type: action.chartType })) as SeriesOptionsType[]
      };
      break;
    default:
      return state;
  }

  // TODO: Remove this once debugging is complete
  if (!isEqual(state, updatedState)) {
    // eslint-disable-next-line no-console
    console.log('State updated:', updatedState);
    // eslint-disable-next-line no-console
    console.log('State before update:', state);
  }
  return isEqual(state, updatedState) ? state : updatedState;
};

export const ChartOptionsProvider = ({ children }: { children: React.ReactNode }) => {
  const [options, dispatch] = useReducer(chartOptionsReducer, defaultChartOptions);

  return (
    <ChartOptionsContext.Provider value={{ options, dispatch }}>
      {children}
    </ChartOptionsContext.Provider>
  );
};

export const useChartOptions = () => {
  const context = useContext(ChartOptionsContext);
  if (!context) throw new Error('useChart must be used within ChartProvider');
  return context;
};
