import React, { createContext, useReducer, useContext } from 'react';

export interface ChartInstance {
  id: string;
  title: string;
}

type DashboardAction = 
  | { type: 'SET_TITLE'; title: string }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_LAYOUT'; layout: string }
  | { type: 'TOGGLE_LIVE' }
  | { type: 'SET_SOURCES'; sources: string[] }
  | { type: 'ADD_SOURCES'; sources: string[] }
  | { type: 'ADD_CHART'; chart: ChartInstance }
  | { type: 'REMOVE_CHART'; id: string }
  | { type: 'FOCUS_CHART'; id: string | null };

const DashboardContext = createContext<{
  title: string;
  sidebarOpen: boolean;
  layout: string;
  live: boolean;
  sources: string[];
  charts: ChartInstance[];
  focusedId: string | null;
  dispatch: React.Dispatch<DashboardAction>;
} | undefined>(undefined);

const dashboardReducer = (state: { 
  title: string; 
  sidebarOpen: boolean; 
  layout: string; 
  live: boolean; 
  sources: string[]
  charts: ChartInstance[];
  focusedId: string | null;
}, action: DashboardAction) => {
  switch (action.type) {
    case 'SET_TITLE':
      return { ...state, title: action.title };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'SET_LAYOUT':
      return { ...state, layout: action.layout };
    case 'TOGGLE_LIVE':
      return { ...state, live: !state.live };
    case 'SET_SOURCES':
      return { ...state, sources: action.sources };
    case 'ADD_SOURCES': {
      // Merge current sources with new ones, removing duplicates
      const mergedSources = [...new Set([...state.sources, ...action.sources])];
      return { ...state, sources: mergedSources };
    }
    case 'ADD_CHART':
      return { ...state, charts: [...state.charts, action.chart] };
    case 'REMOVE_CHART':
      return { 
        ...state, 
        charts: state.charts.filter(chart => chart.id !== action.id) ,
        focusedId: state.focusedId === action.id ? null : state.focusedId
      };
    case 'FOCUS_CHART':
      return { ...state, focusedId: action.id };
    default:
      return state;
  }
};

export const DashboardProvider = ({ children }: { children: React.ReactNode }) => {
  const initialState = {
    title: 'Dashboard',
    sidebarOpen: false,
    layout: 'grid',
    live: false,
    charts: [] as ChartInstance[],
    focusedId: null as string | null,
    sources: [] as string[]
  };

  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  return (
    <DashboardContext.Provider value={{ ...state, dispatch }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) throw new Error('useDashboard must be used within DashboardProvider');
  return context;
};