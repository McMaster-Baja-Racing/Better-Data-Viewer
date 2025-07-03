import isEqual from 'lodash.isequal';
import { AnalyzerType, ChartFileInformation, Column, ChartInformation, DataColumnKey } from '@types';

export type ChartAction =
  | { type: 'UPDATE_FILE'; fileIndex: number; updatedFile: Partial<ChartFileInformation> }
  | { type: 'UPDATE_ANALYZER'; fileIndex: number; analyzerType?: AnalyzerType | null; analyzerValues?: string[] }
  | { type: 'UPDATE_COLUMN'; fileIndex: number; column: DataColumnKey; updatedColumn: Partial<Column> }
  | { type: 'UPDATE_GRAPHING_TYPE'; updatedType: string }
  | { type: 'UPDATE_X_COLUMN_ALL'; updatedColumn: Partial<Column> };

export const chartInformationReducer = (
  state: ChartInformation,
  action: ChartAction
): ChartInformation => {
  console.log('Reducer action:', action);
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

    default:
      return state;
  }

  if (!isEqual(state, updatedState)) {
    console.log('State updated:', updatedState);
    console.log('State before update:', state);
  }
  return isEqual(state, updatedState) ? state : updatedState;
};
