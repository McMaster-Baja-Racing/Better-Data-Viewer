import { AnalyzerType } from '@types';
import { ChartFileInformation, Column, ChartInformation } from '@types'; // adjust your import paths accordingly

export type ChartAction =
  | { type: 'UPDATE_FILE'; fileIndex: number; updatedFile: Partial<ChartFileInformation> }
  | { type: 'UPDATE_ANALYZER'; fileIndex: number; analyzerType?: AnalyzerType | null; analyzerValues?: string[] }
  | { type: 'UPDATE_COLUMN'; fileIndex: number; columnIndex: number; updatedColumn: Partial<Column> }
  | { type: 'UPDATE_GRAPHING_TYPE'; updatedType: string };


export const chartInformationReducer = (state: ChartInformation, action: ChartAction): ChartInformation => {
  console.log('Reducer action:', action); // Debugging line to check the action type and payload

  switch (action.type) {
    case 'UPDATE_FILE':
      return {
        ...state,
        files: state.files.map((file, index) =>
          index === action.fileIndex ? { ...file, ...action.updatedFile } : file
        ),
      };

    case 'UPDATE_ANALYZER':
      return {
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

    case 'UPDATE_COLUMN':
      return {
        ...state,
        files: state.files.map((file, fIndex) => {
          if (fIndex === action.fileIndex) {
            return {
              ...file,
              columns: file.columns.map((col, cIndex) =>
                cIndex === action.columnIndex ? { ...col, ...action.updatedColumn } : col
              ),
            };
          }
          return file;
        }),
      };

    case 'UPDATE_GRAPHING_TYPE':
      return {
        ...state,
        type: action.updatedType,
      };

    default:
      return state;
  }
};