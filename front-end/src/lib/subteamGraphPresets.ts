import { AnalyzerType, DataViewerPreset } from '@types';

export const subteamGraphPresets: DataViewerPreset[] = [
  {
    name: 'Shift Curve',
    description: 'Primary RPM vs Secondary RPM',
    graphs: [
      {
        axes: [
          { file: 'RPM SEC.csv', axis: 'RPM SEC' },
          { file: 'RPM PRIM.csv', axis: 'RPM PRIM' },
        ],
        analyzer: AnalyzerType.ACCEL_CURVE,
        analyzerOptions: [],
        graphType: 'line',
      },
    ],
  },
  {
    name: 'Shift Curve with GPS',
    description: 'Primary RPM vs GPS Speed',
    graphs: [
      {
        axes: [
          { file: 'GPS SPEED.csv', axis: 'GPS SPEED' },
          { file: 'RPM PRIM.csv', axis: 'RPM PRIM' },
        ],
        analyzer: AnalyzerType.ACCEL_CURVE,
        analyzerOptions: [],
        graphType: 'line',
      },
    ],
  },
  {
    name: 'Speed',
    description: 'Vehicle speed vs Timestamp (ms) with Sgolay filter',
    graphs: [
      {
        axes: [
          { file: 'GPS SPEED.csv', axis: 'Timestamp (ms)' },
          { file: 'GPS SPEED.csv', axis: 'GPS SPEED' },
        ],
        analyzer: null,
        analyzerOptions: [],
        graphType: 'line',
      },
    ],
  },
  {
    name: 'Goated Shift Curve',
    description: 'Primary RPM vs Secondary RPM with GPS Speed',
    graphs: [
      {
        axes: [
          { file: 'RPM SEC.csv', axis: 'RPM SEC' },
          { file: 'RPM PRIM.csv', axis: 'RPM PRIM' },
        ],
        analyzer: AnalyzerType.SHIFT_CURVE,
        analyzerOptions: [],
        graphType: 'line',
      },
    ]
  },
  {
    name: 'Map',
    description: 'Map of GPS coordinates',
    graphs: [
      {
        axes: [
          { file: 'GPS LATITUDE.csv', axis: 'GPS LATITUDE' },
          { file: 'GPS LONGITUDE.csv', axis: 'GPS LONGITUDE' },
        ],
        analyzer: AnalyzerType.SHIFT_CURVE,
        analyzerOptions: [],
        graphType: 'line',
      },
    ]
  }
];
