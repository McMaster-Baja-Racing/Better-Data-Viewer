import { AnalyzerType, DataViewerPreset } from '@types';

export const subteamGraphPresets: DataViewerPreset[] = [
  {
    name: 'Speed',
    description: 'Vehicle speed vs Timestamp (ms) with Sgolay filter',
    graphs: [
      {
        axes: [
          { source: 'GPS SPEED.csv', dataType: 'Timestamp (ms)' },
          { source: 'GPS SPEED.csv', dataType: 'GPS SPEED' },
        ],
        analyzer: null,
        analyzerOptions: [],
        graphType: 'line',
      },
    ],
  },
  {
    name: 'Strict Timestamp (Zany Outlier Removal) GPS SPEED',
    description: 'GPS Speed vs Timestamp (ms) with strict timestamp outlier removal',
    graphs: [
      {
        axes: [
          { source: 'GPS SPEED.csv', dataType: 'Timestamp (ms)' },
          { source: 'GPS SPEED.csv', dataType: 'GPS SPEED' },
        ],
        analyzer: AnalyzerType.STRICT_TIMESTAMP,
        analyzerOptions: [],
        graphType: 'line',
      },
    ],
  },
  {
    name: 'Smooth Strict RPM',
    description: 'Primary and Secondary RPM vs Timestamp (ms) smoothened with strict timestamp outlier removal',
    graphs: [
      {
        axes: [
          { source: 'RPM PRIM.csv', dataType: 'Timestamp (ms)' },
          { source: 'RPM PRIM.csv', dataType: 'RPM PRIM' },
        ],
        analyzer: AnalyzerType.SMOOTH_STRICT_PRIM,
        analyzerOptions: [],
        graphType: 'line',
      },
      {
        axes: [
          { source: 'RPM SEC.csv', dataType: 'Timestamp (ms)' },
          { source: 'RPM SEC.csv', dataType: 'RPM SEC' },
        ],
        analyzer: AnalyzerType.SMOOTH_STRICT_SEC,
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
          { source: 'RPM SEC.csv', dataType: 'RPM SEC' },
          { source: 'RPM PRIM.csv', dataType: 'RPM PRIM' },
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
          { source: 'GPS LATITUDE.csv', dataType: 'GPS LATITUDE' },
          { source: 'GPS LONGITUDE.csv', dataType: 'GPS LONGITUDE' },
        ],
        analyzer: AnalyzerType.SHIFT_CURVE,
        analyzerOptions: [],
        graphType: 'line',
      },
    ]
  },
  {
    name: 'Smooth Primary RPM with Strict Timestamp',
    description: 'Smooths PRIM RPM with strict timestamp outlier removal',
    graphs: [
      {
        axes: [
          { source: 'RPM PRIM.csv', dataType: 'Timestamp (ms)' },
          { source: 'RPM PRIM.csv', dataType: 'RPM PRIM' },
        ],
        analyzer: AnalyzerType.SMOOTH_STRICT_PRIM,
        analyzerOptions: [],
        graphType: 'line',
      },
    ],
  },
  {
    name: 'Smooth Secondary RPM with Strict Timestamp',
    description: 'Smooths SEC RPM with strict timestamp outlier removal',
    graphs: [
      {
        axes: [
          { source: 'RPM SEC.csv', dataType: 'Timestamp (ms)' },
          { source: 'RPM SEC.csv', dataType: 'RPM SEC' },
        ],
        analyzer: AnalyzerType.SMOOTH_STRICT_SEC,
        analyzerOptions: [],
        graphType: 'line',
      },
    ],
  },
];
