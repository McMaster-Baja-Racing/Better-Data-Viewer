import isEqual from 'lodash.isequal';
import { 
  AnalyzerType, 
  ChartFileInformation, 
  Column, 
  ChartInformation, 
  DataColumnKey, 
  DataViewerPreset, 
  ChartAnalyzerInformation, 
  dataColumnKeys, 
  SeriesType
} from '@types';

export type ChartAction =
  | { type: 'UPDATE_FILE'; fileIndex: number; updatedFile: Partial<ChartFileInformation> }
  | { type: 'UPDATE_ANALYZER'; fileIndex: number; analyzerType?: AnalyzerType | null; analyzerValues?: string[] }
  | { type: 'UPDATE_COLUMN'; fileIndex: number; column: DataColumnKey; updatedColumn: Partial<Column> }
  | { type: 'UPDATE_GRAPHING_TYPE'; updatedType: SeriesType }
  | { type: 'UPDATE_X_COLUMN_ALL'; updatedColumn: Partial<Column> }
  | { type: 'UPDATE_ANALYZER_TYPE_ALL'; analyzerType?: AnalyzerType | null; analyzerValues?: string[] };

export const chartInformationReducer = (
  state: ChartInformation,
  action: ChartAction
): ChartInformation => {
  let updatedState = state;

  switch (action.type) {
    case 'UPDATE_FILE': {
      updatedState = {
        ...state,
        files: state.files.map((file, index) =>
          index === action.fileIndex ? { ...file, ...action.updatedFile } : file
        ),
      };
      break;
    }

    case 'UPDATE_ANALYZER': {
      updatedState = {
        ...state,
        files: state.files.map((file, index) =>
          index === action.fileIndex
            ? {
              ...file,
              analyze: {
                type: action.analyzerType !== undefined ? action.analyzerType : file.analyze.type,
                analyzerValues:
                    action.analyzerValues !== undefined ? action.analyzerValues : file.analyze.analyzerValues,
              },
            }
            : file
        ),
      };
      break;
    }

    case 'UPDATE_COLUMN': {
      updatedState = {
        ...state,
        files: state.files.map((file, idx) =>
          idx === action.fileIndex
            ? {
              ...file,
              [action.column]: {
                ...file[action.column],
                ...action.updatedColumn,
              },
            }
            : file
        ),
      };
      break;
    }

    case 'UPDATE_X_COLUMN_ALL': {
      updatedState = {
        ...state,
        files: state.files.map((file) => ({
          ...file,
          x: {
            ...file.x,
            ...action.updatedColumn,
          },
        })),
      };
      break;
    }

    case 'UPDATE_GRAPHING_TYPE': {
      updatedState = { ...state, type: action.updatedType };
      break;
    }

    case 'UPDATE_ANALYZER_TYPE_ALL': {
      updatedState = {
        ...state,
        files: state.files.map((file) => ({
          ...file,
          analyze: {
            type: action.analyzerType !== undefined ? action.analyzerType : file.analyze.type,
            analyzerValues: action.analyzerValues !== undefined ? action.analyzerValues : file.analyze.analyzerValues,
          },
        })),
      };
      break;
    }

    default:
      return state;
  }

  if (!isEqual(state, updatedState)) {
    // TODO: Remove this once chartInformation is complete
    // eslint-disable-next-line no-console
    console.log('State updated:', updatedState);
    // eslint-disable-next-line no-console
    console.log('State before update:', state);
  }
  return isEqual(state, updatedState) ? state : updatedState;
};

export const generateChartInformation = (
  fileKeys: string[],
  preset: DataViewerPreset
): ChartInformation => {
  const chartInformations: ChartInformation[] = preset.graphs.map((currGraph) => {
    const cols: (Column | null)[] = dataColumnKeys.map((key, idx) => {
      const axisDef = currGraph.axes[idx];
      if (!axisDef) return null;
      return {
        header: axisDef.axis,
        filename: `${fileKeys[0]}/${axisDef.file}`,
        timespan: { start: null, end: null }
      };
    });

    if (!cols[0] || !cols[1]) {  
      throw new Error('Required axes (x and y) are missing in the graph configuration.');  
    }

    const [x, y, z] = cols;
  
    const analyze: ChartAnalyzerInformation = {
      type: currGraph.analyzer,
      analyzerValues: currGraph.analyzerOptions
    };
  
    const fileEntry: ChartFileInformation = { x: x, y: y, z: z || null, analyze };
  
    return {
      files: [fileEntry],
      live: false,
      type: currGraph.graphType,
      hasTimestampX: fileEntry.x.header === 'Timestamp (ms)',
      hasGPSTime: fileEntry.x.timespan.start != null
    };
  });
  
  // Return the first chart /// TODO: Extend for multiple
  return chartInformations[0];
};