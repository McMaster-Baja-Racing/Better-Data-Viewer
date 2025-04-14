import isEqual from 'lodash.isequal';
import { AnalyzerType } from '@types';
import { ChartFileInformation, Column, ChartInformation } from '@types';
import { is } from '@react-three/fiber/dist/declarations/src/core/utils';

export type ChartAction =
  | { type: 'UPDATE_FILE'; fileIndex: number; updatedFile: Partial<ChartFileInformation> }
  | { type: 'UPDATE_ANALYZER'; fileIndex: number; analyzerType?: AnalyzerType | null; analyzerValues?: string[] }
  | { type: 'UPDATE_COLUMN'; fileIndex: number; columnIndex: number; updatedColumn: Partial<Column> }
  | { type: 'UPDATE_GRAPHING_TYPE'; updatedType: string };

export const chartInformationReducer = (
  state: ChartInformation,
  action: ChartAction
): ChartInformation => {
  console.log('Reducer action:', action); // Debugging line
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
        files: state.files.map((file, index) => {
          if (index === action.fileIndex) {
            return {
              ...file,
              analyze: {
                type: action.analyzerType !== undefined ? action.analyzerType : file.analyze.type,
                analyzerValues:
                  action.analyzerValues !== undefined ? action.analyzerValues : file.analyze.analyzerValues,
              },
            };
          }
          return file;
        }),
      };
      break;
    }

    case 'UPDATE_COLUMN': {
      updatedState = {
        ...state,
        files: state.files.map((file, fileIndex) => {
          if (fileIndex === action.fileIndex) {
            return {
              ...file,
              columns: file.columns.map((col, colIndex) =>
                colIndex === action.columnIndex ? { ...col, ...action.updatedColumn } : col
              ),
            };
          }
          return file;
        }),
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

  // Return original state if no changes were made.
  if (!isEqual(state, updatedState)) {
    console.log('State updated:', updatedState); // Debugging line
    console.log('State before update:', state); // Debugging line
  }
  return isEqual(state, updatedState) ? state : updatedState;
};
