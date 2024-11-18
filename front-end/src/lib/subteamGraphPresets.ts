import { AnalyzerType, DataViewerPreset, GraphPreset } from '@types';

export const subteamGraphPresets: DataViewerPreset[] = [
    {
        name: 'Shift Curve',
        description: 'Primary RPM vs secondary RPM',
        graphs: [
            {
                xAxis: 'RPM PRIM',
                yAxis: 'RPM SEC',
                analyser: AnalyzerType.SGOLAY,
                graphType: 'line'
            },
        ],
    },
    {
        name: 'Speed',
        description: 'GPS speed over time',
        graphs: [
            {
                xAxis: 'Timestamp (ms)',
                yAxis: 'GPS SPEED',
                analyser: null,
                graphType: 'line'
            },
        ],
    },
    {
        name: 'Primary RPM',
        description:
            'Primary RPM over time smoothed with Savitzky-Golay filter',
        graphs: [
            {
                xAxis: 'Timestamp (ms)',
                yAxis: 'SEC_RPM',
                analyser: AnalyzerType.SGOLAY,
                graphType: 'line'
            },
        ],
    },
    {
        name: 'Secondary RPM',
        description:
            'Secondary RPM over time smoothed with Savitzky-Golay filter',
        graphs: [
            {
                xAxis: 'PRIM_RPM',
                yAxis: 'SEC_RPM',
                analyser: AnalyzerType.SGOLAY,
                graphType: 'line'
            },
        ],
    },
];
