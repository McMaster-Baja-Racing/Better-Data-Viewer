import { chartType, AnalyzerType } from '@types';

/**
 * axes[i] is the name of a data series inside axisFiles[i]
 */
export interface GraphPreset {
    axes: {file: string, axis: string}[],
    analyzer: AnalyzerType | null,
    analyzerOptions: string[],
    graphType: chartType,
}

export interface DataViewerPreset {
    name: string,
    description: string,
    graphs: GraphPreset[]
}