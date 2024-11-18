import { AnalyzerType } from "./ApiTypes"

export type GraphPreset = {
    xAxis: string,
    yAxis: string,
    analyser: AnalyzerType | null,
    graphType: string
}

export type DataViewerPreset = {
    name: string,
    description: string,
    graphs: GraphPreset[]
}