import { AnalyzerType } from './ApiTypes';

/**
 * axes[i] is the name of a data series inside axisFiles[i]
 */
export interface GraphPreset {
    axisFiles: string[],
    axes: string[],
    analyser: AnalyzerType | null,
    analyserOptions: string[],
    graphType: string
}

export interface DataViewerPreset {
    name: string,
    description: string,
    graphs: GraphPreset[]
}