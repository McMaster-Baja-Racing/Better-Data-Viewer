import React, { createContext, useReducer, useContext } from 'react';
import { Options } from 'highcharts';
import { defaultChartOptions } from '@lib/chartOptions';

type ChartOptionsAction =
  | { type: 'SET_SUBTITLE'; text: string }
  | { type: 'TOGGLE_LEGEND' }
  | { type: 'REPLACE_OPTIONS'; options: Options };

const ChartOptionsContext = createContext<{
  options: Options;
  dispatch: React.Dispatch<ChartOptionsAction>;
} | undefined>(undefined);

const chartOptionsReducer = (state: Options, action: ChartOptionsAction): Options => {
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
