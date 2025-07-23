import { ChartType, AnalyzerType, DataTypes } from '@types';

/**
 * axes[i] is the name of a data series inside axisFiles[i]
 */
export interface GraphPreset {
    axes: {source: string, dataType: DataTypes}[],
    analyzer: AnalyzerType | null,
    analyzerOptions: string[],
    graphType: ChartType,
}

export interface DataViewerPreset {
    name: string,
    description: string,
    graphs: GraphPreset[]
}