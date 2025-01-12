import { AnalyzerType, DataViewerPreset } from '@types';

export const subteamGraphPresets: DataViewerPreset[] = [
  {
    name: 'Shift Curve',
    description: 'Primary RPM vs Secondary RPM',
    graphs: [
      {
        axisFiles: ['RPM SEC.csv', 'RPM PRIM.csv'],
        axes: ['RPM SEC', 'RPM PRIM'],
        analyser: AnalyzerType.ACCEL_CURVE,
        graphType: 'line'
      },
    ],
  },
  {
    name: 'Speed',
    description: 'Vehicle speed vs Timestamp (ms) with Sgolay filter',
    graphs: [
      {
        axisFiles: ['GPS SPEED.csv', 'GPS SPEED.csv'],
        axes: ['Timestamp (ms)', 'GPS SPEED'],
        analyser: AnalyzerType.SGOLAY,
        graphType: 'line'
      },
    ],
  },
];
