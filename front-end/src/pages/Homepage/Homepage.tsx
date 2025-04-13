import { TitleCard } from "@components/titleCard/titleCard"
import { PresetList } from "@components/presetList/PresetList"
import { Footer } from "@components/Footer/Footer"
import styles from "./Homepage.module.scss"
import { ChartAnalyzerInformation, ChartFileInformation, ChartInformation, Column, DataViewerPreset } from "@types"
import { useModal } from "../../ModalContext"
import { useNavigate } from "react-router-dom"  // See if this works on Electron

export const Homepage = () => {
  const { openModal } = useModal();
  const navigate = useNavigate();

  const generateChartInformation = (fileKeys: string[], preset: DataViewerPreset) => {
    const chartInformations: ChartInformation[] = [];
    for(const currGraph of preset.graphs) {
      const columns: Column[] = [];
      const analyze: ChartAnalyzerInformation = {
        type: currGraph.analyzer,
        analyzerValues: currGraph.analyzerOptions,
      };
      for (let i = 0; i < currGraph.axes.length; i++) {
        columns.push({
          header: currGraph.axes[i].axis,
          filename: fileKeys[0] + '/' + currGraph.axes[i].file,
          timespan: { start: null, end: null },
        });
      }
      const chartInformationFiles: ChartFileInformation[] = [
        {
          columns: columns,
          analyze: analyze,
        },
      ];
  
      const chartInformation: ChartInformation = {
        files: chartInformationFiles,
        live: false,
        type: currGraph.graphType,
        // Only true if all files have Timestamp (ms) as the first column
        hasTimestampX: !chartInformationFiles.some(
          (file) => file.columns[0].header !== 'Timestamp (ms)'
        ),
        // Only true if all files have a timespan from the GPS data
        hasGPSTime: !chartInformationFiles.some(
          (file) => file.columns[0].timespan.start == null
        ),
      };
      chartInformations.push(chartInformation);
    }
    // TODO: Handle multiple charts
    return chartInformations[0];
  }

  const onSubmit = (fileKeys: string[], preset: DataViewerPreset) => {
    const chartInformation = generateChartInformation(fileKeys, preset);
    navigate('dataview', {state: {chartInformation}});
  }

  const handleClick = (preset: DataViewerPreset) => {
    openModal('preset', {onSubmit: onSubmit, preset: preset});
  }

  return (
    <div className={styles.homepage}>
      <TitleCard />
      <div className={styles.body}>
        <PresetList handleClick={handleClick}/>
      </div>
      <div className={styles.footerWrapper}>
        <Footer />
      </div>
    </div>
  )

}