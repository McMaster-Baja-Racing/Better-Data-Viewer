import React, { createContext, useReducer, useContext } from 'react';

type DashboardAction = 
  | { type: 'SET_TITLE'; title: string }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_LAYOUT'; layout: string }
  | { type: 'TOGGLE_LIVE' }
  | { type: 'SET_SOURCES'; sources: string[] }
  | { type: 'ADD_SOURCES'; sources: string[] };

const DashboardContext = createContext<{
  title: string;
  sidebarOpen: boolean;
  layout: string;
  live: boolean;
  sources: string[];
  dispatch: React.Dispatch<DashboardAction>;
} | undefined>(undefined);

const dashboardReducer = (state: { 
  title: string; sidebarOpen: boolean; layout: string; live: boolean; sources: string[]
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