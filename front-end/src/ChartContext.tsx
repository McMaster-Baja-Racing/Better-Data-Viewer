import React, { createContext, useReducer, useContext } from 'react';
import { Options } from 'highcharts';
import { defaultChartOptions } from '@lib/chartOptions';

type ChartAction =
  | { type: 'SET_SUBTITLE'; text: string }
  | { type: 'TOGGLE_LEGEND' }
  | { type: 'REPLACE_OPTIONS'; options: Options };

const ChartContext = createContext<{
  options: Options;
  dispatch: React.Dispatch<ChartAction>;
} | undefined>(undefined);

const chartReducer = (state: Options, action: ChartAction): Options => {
  switch (action.type) {
    case 'SET_SUBTITLE':
      return {
        ...state,
        subtitle: { ...state.subtitle, text: action.text },
      };
    case 'TOGGLE_LEGEND':
      return {
        ...state,
        legend: {
          ...state.legend,
          enabled: !state.legend?.enabled,
        },
      };
    case 'REPLACE_OPTIONS':
      return action.options;
    default:
      return state;
  }
};

export const ChartProvider = ({ children }: { children: React.ReactNode }) => {
  const [options, dispatch] = useReducer(chartReducer, defaultChartOptions);

  return (
    <ChartContext.Provider value={{ options, dispatch }}>
      {children}
    </ChartContext.Provider>
  );
};

export const useChart = () => {
  const context = useContext(ChartContext);
  if (!context) throw new Error('useChart must be used within ChartProvider');
  return context;
};
