import React, { createContext, useReducer, useContext } from 'react';
import { Options, SeriesOptionsType, XAxisOptions, YAxisOptions } from 'highcharts';
import { defaultChartOptions } from '@lib/chartOptions';
import isEqual from 'lodash.isequal';
import { ChartType } from '@types';

// Helper function to safely get axis title text
export const getAxisTitle = (
  axis: XAxisOptions | XAxisOptions[] | YAxisOptions | YAxisOptions[] | undefined
): string => {
  if (!axis) return '';
  if (Array.isArray(axis)) {
    return axis[0]?.title?.text || '';
  }
  return axis.title?.text || '';
};

type ChartOptionsAction =
  | { type: 'SET_SUBTITLE'; text: string }
  | { type: 'TOGGLE_LEGEND' }
  | { type: 'REPLACE_OPTIONS'; options: Options }
  | { type: 'CLEAR_SERIES'}
  | { type: 'ADD_SERIES'; series: SeriesOptionsType }
  | { type: 'SET_AXIS_TITLE'; axis: 'xAxis' | 'yAxis'; title: string }
  | { type: 'SET_CHART_TYPE'; chartType: ChartType }
  | { type: 'UPSERT_SERIES'; index: number, series: SeriesOptionsType };

const ChartOptionsContext = createContext<{
  options: Options;
  dispatch: React.Dispatch<ChartOptionsAction>;
} | undefined>(undefined);

const chartOptionsReducer = (state: Options, action: ChartOptionsAction): Options => {
  //console.log('ChartOptionsReducer called with action:', action);
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
    case 'SET_AXIS_TITLE': {
      const currentAxis = state[action.axis];
      const updatedAxis = Array.isArray(currentAxis) 
        ? currentAxis.map((axis: XAxisOptions | YAxisOptions, index: number) => index === 0 ? {
          ...axis,
          title: {
            ...axis?.title,
            text: action.title,
          },
        } : axis)
        : {
          ...currentAxis,
          title: {
            ...currentAxis?.title,
            text: action.title,
          },
        };
      
      updatedState = {
        ...state,
        [action.axis]: updatedAxis,
      };
      break;
    }
    case 'SET_CHART_TYPE':
      updatedState = {
        ...state,
        series: (state.series || [])
          .map(s => ({ ...s, type: action.chartType })) as SeriesOptionsType[]
      };
      break;
    case 'UPSERT_SERIES': {
      const seriesArr = state.series ? [...state.series] : [];
      if (seriesArr[action.index]) {
        seriesArr[action.index] = action.series;
      } else {
        seriesArr[action.index] = action.series;
      }
      updatedState = {
        ...state,
        series: seriesArr
      };
      break;
    }
    default:
      return state;
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
