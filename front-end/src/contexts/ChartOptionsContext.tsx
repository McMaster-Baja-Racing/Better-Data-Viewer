import React, { createContext, useReducer, useContext } from 'react';
import { XAxisOptions, YAxisOptions } from 'highcharts';
import { defaultChartOptions } from '@lib/chartOptions';
import isEqual from 'lodash.isequal';
import { ChartType, CustomOptions, ExtendedSeriesOptionsType } from '@types';

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
  | { type: 'SET_LEGEND_POSITION'; position: 'top' | 'bottom' | 'left' | 'right' }
  | { type: 'SET_LEGEND_ALIGN'; align: 'left' | 'center' | 'right' }
  | { type: 'TOGGLE_GRID_LINES'; axis: 'xAxis' | 'yAxis' }
  | { type: 'TOGGLE_MINOR_GRID_LINES'; axis: 'xAxis' | 'yAxis' }
  | { type: 'SET_GRID_LINE_COLOR'; axis: 'xAxis' | 'yAxis'; color: string }
  | { type: 'TOGGLE_AXIS_LABELS'; axis: 'xAxis' | 'yAxis' }
  | { type: 'SET_AXIS_LABEL_ROTATION'; axis: 'xAxis' | 'yAxis'; rotation: number }
  | { type: 'TOGGLE_ZOOM'; enabled: boolean }
  | { type: 'SET_ZOOM_TYPE'; zoomType: 'x' | 'y' | 'xy' }
  | { type: 'TOGGLE_TOOLTIP' }
  | { type: 'SET_TOOLTIP_FORMAT'; format: string }
  | { type: 'TOGGLE_CROSSHAIR'; axis: 'xAxis' | 'yAxis' }
  | { type: 'SET_BACKGROUND_COLOR'; color: string }
  | { type: 'SET_PLOT_BACKGROUND_COLOR'; color: string }
  | { type: 'TOGGLE_ANIMATION' }
  | { type: 'SET_AXIS_MIN_MAX'; axis: 'xAxis' | 'yAxis'; min?: number; max?: number }
  | { type: 'TOGGLE_AXIS_OPPOSITE'; axis: 'xAxis' | 'yAxis' }
  | { type: 'SET_SERIES_LINE_WIDTH'; width: number }
  | { type: 'TOGGLE_SERIES_MARKERS' }
  | { type: 'SET_SERIES_MARKER_SIZE'; size: number }
  | { type: 'REPLACE_OPTIONS'; options: CustomOptions }
  | { type: 'CLEAR_SERIES'}
  | { type: 'ADD_SERIES'; series: ExtendedSeriesOptionsType }
  | { type: 'SET_AXIS_TITLE'; axis: 'xAxis' | 'yAxis'; title: string }
  | { type: 'SET_CHART_TYPE'; chartType: ChartType }
  | { type: 'UPSERT_SERIES'; index: number, series: ExtendedSeriesOptionsType };

const ChartOptionsContext = createContext<{
  options: CustomOptions;
  dispatch: React.Dispatch<ChartOptionsAction>;
} | undefined>(undefined);

const chartOptionsReducer = (state: CustomOptions, action: ChartOptionsAction): CustomOptions => {
  //console.log('ChartOptionsReducer called with action:', action);
  let updatedState: CustomOptions = state;

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
    case 'SET_LEGEND_POSITION':
      updatedState = {
        ...state,
        legend: {
          ...state.legend,
          verticalAlign: action.position === 'top' || action.position === 'bottom' ? action.position : 'bottom',
          align: action.position === 'left' || action.position === 'right' ? action.position : 'center',
        },
      };
      break;
    case 'SET_LEGEND_ALIGN':
      updatedState = {
        ...state,
        legend: {
          ...state.legend,
          align: action.align,
        },
      };
      break;
    case 'TOGGLE_GRID_LINES': {
      const currentAxis = state[action.axis];
      const updatedAxis = Array.isArray(currentAxis)
        ? currentAxis.map((axis, index) => index === 0 ? {
          ...axis,
          gridLineWidth: axis.gridLineWidth === 0 ? 1 : 0,
        } : axis)
        : {
          ...currentAxis,
          gridLineWidth: currentAxis?.gridLineWidth === 0 ? 1 : 0,
        };
      
      updatedState = {
        ...state,
        [action.axis]: updatedAxis,
      };
      break;
    }
    case 'TOGGLE_MINOR_GRID_LINES': {
      const currentAxis = state[action.axis];
      const updatedAxis = Array.isArray(currentAxis)
        ? currentAxis.map((axis, index) => index === 0 ? {
          ...axis,
          minorGridLineWidth: axis.minorGridLineWidth === 0 ? 0.5 : 0,
        } : axis)
        : {
          ...currentAxis,
          minorGridLineWidth: currentAxis?.minorGridLineWidth === 0 ? 0.5 : 0,
        };
      
      updatedState = {
        ...state,
        [action.axis]: updatedAxis,
      };
      break;
    }
    case 'SET_GRID_LINE_COLOR': {
      const currentAxis = state[action.axis];
      const updatedAxis = Array.isArray(currentAxis)
        ? currentAxis.map((axis, index) => index === 0 ? {
          ...axis,
          gridLineColor: action.color,
        } : axis)
        : {
          ...currentAxis,
          gridLineColor: action.color,
        };
      
      updatedState = {
        ...state,
        [action.axis]: updatedAxis,
      };
      break;
    }
    case 'TOGGLE_AXIS_LABELS': {
      const currentAxis = state[action.axis];
      const updatedAxis = Array.isArray(currentAxis)
        ? currentAxis.map((axis, index) => index === 0 ? {
          ...axis,
          labels: {
            ...axis?.labels,
            enabled: !axis?.labels?.enabled,
          },
        } : axis)
        : {
          ...currentAxis,
          labels: {
            ...currentAxis?.labels,
            enabled: !currentAxis?.labels?.enabled,
          },
        };
      
      updatedState = {
        ...state,
        [action.axis]: updatedAxis,
      };
      break;
    }
    case 'SET_AXIS_LABEL_ROTATION': {
      const currentAxis = state[action.axis];
      const updatedAxis = Array.isArray(currentAxis)
        ? currentAxis.map((axis, index) => index === 0 ? {
          ...axis,
          labels: {
            ...axis?.labels,
            rotation: action.rotation,
          },
        } : axis)
        : {
          ...currentAxis,
          labels: {
            ...currentAxis?.labels,
            rotation: action.rotation,
          },
        };
      
      updatedState = {
        ...state,
        [action.axis]: updatedAxis,
      };
      break;
    }
    case 'TOGGLE_ZOOM':
      updatedState = {
        ...state,
        chart: {
          ...state.chart,
          zooming: {
            ...state.chart?.zooming,
            type: action.enabled ? (state.chart?.zooming?.type || 'x') : undefined,
          },
        },
      };
      break;
    case 'SET_ZOOM_TYPE':
      updatedState = {
        ...state,
        chart: {
          ...state.chart,
          zooming: { 
            ...state.chart?.zooming,
            type: action.zoomType 
          },
        },
      };
      break;
    case 'TOGGLE_TOOLTIP':
      updatedState = {
        ...state,
        tooltip: {
          ...state.tooltip,
          enabled: !state.tooltip?.enabled,
        },
      };
      break;
    case 'SET_TOOLTIP_FORMAT':
      updatedState = {
        ...state,
        tooltip: {
          ...state.tooltip,
          pointFormat: action.format,
        },
      };
      break;
    case 'TOGGLE_CROSSHAIR': {
      const currentAxis = state[action.axis];
      const updatedAxis = Array.isArray(currentAxis)
        ? currentAxis.map((axis, index) => index === 0 ? {
          ...axis,
          crosshair: !axis?.crosshair,
        } : axis)
        : {
          ...currentAxis,
          crosshair: !currentAxis?.crosshair,
        };
      
      updatedState = {
        ...state,
        [action.axis]: updatedAxis,
      };
      break;
    }
    case 'SET_BACKGROUND_COLOR':
      updatedState = {
        ...state,
        chart: {
          ...state.chart,
          backgroundColor: action.color,
        },
      };
      break;
    case 'SET_PLOT_BACKGROUND_COLOR':
      updatedState = {
        ...state,
        chart: {
          ...state.chart,
          plotBackgroundColor: action.color,
        },
      };
      break;
    case 'TOGGLE_ANIMATION':
      updatedState = {
        ...state,
        chart: {
          ...state.chart,
          animation: !state.chart?.animation,
        },
      };
      break;
    case 'SET_AXIS_MIN_MAX': {
      const currentAxis = state[action.axis];
      const updatedAxis = Array.isArray(currentAxis)
        ? currentAxis.map((axis, index) => index === 0 ? {
          ...axis,
          ...(action.min !== undefined && { min: action.min }),
          ...(action.max !== undefined && { max: action.max }),
        } : axis)
        : {
          ...currentAxis,
          ...(action.min !== undefined && { min: action.min }),
          ...(action.max !== undefined && { max: action.max }),
        };
      
      updatedState = {
        ...state,
        [action.axis]: updatedAxis,
      };
      break;
    }
    case 'TOGGLE_AXIS_OPPOSITE': {
      const currentAxis = state[action.axis];
      const updatedAxis = Array.isArray(currentAxis)
        ? currentAxis.map((axis, index) => index === 0 ? {
          ...axis,
          opposite: !axis?.opposite,
        } : axis)
        : {
          ...currentAxis,
          opposite: !currentAxis?.opposite,
        };
      
      updatedState = {
        ...state,
        [action.axis]: updatedAxis,
      };
      break;
    }
    case 'SET_SERIES_LINE_WIDTH':
      updatedState = {
        ...state,
        series: (state.series || []).map(s => ({ ...s, lineWidth: action.width } as ExtendedSeriesOptionsType)),
      };
      break;
    case 'TOGGLE_SERIES_MARKERS':
      updatedState = {
        ...state,
        series: (state.series || []).map(s => {
          const seriesWithMarker = s as ExtendedSeriesOptionsType & { marker?: { enabled?: boolean } };
          return { 
            ...s, 
            marker: { 
              ...seriesWithMarker.marker, 
              enabled: !seriesWithMarker.marker?.enabled 
            } 
          } as ExtendedSeriesOptionsType;
        }),
      };
      break;
    case 'SET_SERIES_MARKER_SIZE':
      updatedState = {
        ...state,
        series: (state.series || []).map(s => {
          const seriesWithMarker = s as ExtendedSeriesOptionsType & { marker?: { radius?: number } };
          return { 
            ...s, 
            marker: { 
              ...seriesWithMarker.marker, 
              radius: action.size 
            } 
          } as ExtendedSeriesOptionsType;
        }),
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
          .map(s => ({ ...s, type: action.chartType })) as ExtendedSeriesOptionsType[]
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
  const [options, dispatch] = useReducer(chartOptionsReducer, defaultChartOptions as CustomOptions);

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
