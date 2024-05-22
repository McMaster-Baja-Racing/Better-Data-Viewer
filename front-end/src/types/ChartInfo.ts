import { AnalyzerData } from './AnalyzerData';

interface ChartInfo {
    files: File[],
    live: boolean,
    type: GraphType,
    hasTimestampX: boolean,
    hasGPSTime: boolean,
}

interface File {
    columns: Column[],
    analyzer: AnalyzerData
}

interface Column {
    header: string,
    filename: string,
    timespan: Timespan,
}

interface Timespan {
    start: string;
    end: string;
}

enum GraphType {
    Line = 'line',
    Video = 'video',
    XYColour = 'coloredline',
    Spline = 'spline',
    Scatter = 'scatter'
}


export { ChartInfo, GraphType };
    
