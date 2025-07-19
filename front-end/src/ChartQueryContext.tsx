import React, { createContext, useReducer, useContext } from 'react';
import { Series, Column, Analyzer } from 'types/ChartQuery';
import isEqual from 'lodash.isequal';

type ChartQueryAction =
  | { type: 'SET_SERIES'; series: Series[] }
  | { type: 'ADD_SERIES'; series: Series }
  | { type: 'REMOVE_SERIES'; index: number }
  | { type: 'UPDATE_SERIES'; index: number; series: Partial<Series> }
  | { type: 'UPDATE_COLUMN'; index: number; columnKey: 'x' | 'y'; column: Partial<Column> }
  | { type: 'UPDATE_ANALYZER'; index: number; analyzer: Partial<Analyzer> }
  | { type: 'UPDATE_X_COLUMN_ALL'; xColumn: Partial<Column> }
  | { type: 'UPDATE_ANALYZER_ALL'; analyzer: Partial<Analyzer> };

const ChartQueryContext = createContext<{
  series: Series[];
  dispatch: React.Dispatch<ChartQueryAction>;
} | undefined>(undefined);

const chartQueryReducer = (state: Series[], action: ChartQueryAction): Series[] => {
  //console.log('ChartQueryReducer called with action:', action);
  let updatedState: Series[] = state;

  switch (action.type) {
    case 'SET_SERIES':
      updatedState = action.series;
      break;
    case 'ADD_SERIES':
      updatedState = [...state, action.series];
      break;
    case 'REMOVE_SERIES':
      updatedState = state.filter((_, index) => index !== action.index);
      break;
    case 'UPDATE_SERIES': {
      updatedState = state.map((series, index) =>
        index === action.index ? { ...series, ...action.series } : series
      );
      break;
    }
    case 'UPDATE_COLUMN': {
      updatedState = state.map((series, index) =>
        index === action.index
          ? { ...series, [action.columnKey]: { ...series[action.columnKey], ...action.column } }
          : series
      );
      break;
    }
    case 'UPDATE_ANALYZER': {
      updatedState = state.map((series, index) =>
        index === action.index
          ? { ...series, analyzer: { ...series.analyzer, ...action.analyzer } }
          : series
      );
      break;
    }
    case 'UPDATE_X_COLUMN_ALL': {
      updatedState = state.map((series) => ({
        ...series,
        x: { ...series.x, ...action.xColumn },
      }));
      break;
    }
    case 'UPDATE_ANALYZER_ALL': {
      updatedState = state.map((series) => ({
        ...series,
        analyzer: { ...series.analyzer, ...action.analyzer },
      }));
      break;
    }
    default:
      return state;
  }

  return isEqual(state, updatedState) ? state : updatedState;
};

export const ChartQueryProvider = ({ children }: { children: React.ReactNode }) => {
  const [series, dispatch] = useReducer(chartQueryReducer, []);

  return (
    <ChartQueryContext.Provider value={{ series, dispatch }}>
      {children}
    </ChartQueryContext.Provider>
  );
};

export const useChartQuery = () => {
  const context = useContext(ChartQueryContext);
  if (!context) throw new Error('useChartQuery must be used within ChartQueryProvider');
  return context;
};