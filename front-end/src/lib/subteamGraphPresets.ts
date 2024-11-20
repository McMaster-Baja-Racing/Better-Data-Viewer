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
  }
];
