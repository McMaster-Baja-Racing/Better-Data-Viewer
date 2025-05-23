import { AnalyzerType, DataViewerPreset } from '@types';

export const subteamGraphPresets: DataViewerPreset[] = [
    {
        name: 'Shift Curve',
        description: 'Primary RPM vs Secondary RPM',
        graphs: [
            {
                axes: [
                    { file: 'RPM_SEC.csv', axis: 'RPM_SEC' },
                    { file: 'RPM_PRIM.csv', axis: 'RPM_PRIM' },
                ],
                analyzer: AnalyzerType.ACCEL_CURVE,
                analyzerOptions: [],
                graphType: 'line',
            },
        ],
    },
    {
        name: 'Shift Curve with GPS',
        description: 'Primary RPM vs GPS_SPEED',
        graphs: [
            {
                axes: [
                    { file: 'GPS_SPEED.csv', axis: 'GPS_SPEED' },
                    { file: 'RPM_PRIM.csv', axis: 'RPM_PRIM' },
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
                    { file: 'GPS_SPEED.csv', axis: 'Timestamp (ms)' },
                    { file: 'GPS_SPEED.csv', axis: 'GPS_SPEED' },
                ],
                analyzer: null,
                analyzerOptions: ['100', '3'],
                graphType: 'line',
            },
        ],
    },
    {
        name: "Goated Shift Curve",
        description: "Primary RPM vs Secondary RPM with GPS_SPEED",
        graphs: [
            {
                axes: [
                    { file: 'RPM_SEC.csv', axis: 'RPM_SEC' },
                    { file: 'RPM_PRIM.csv', axis: 'RPM_PRIM' },
                ],
                analyzer: AnalyzerType.SHIFT_CURVE,
                analyzerOptions: [],
                graphType: 'line',
            },
        ]
    }
];
