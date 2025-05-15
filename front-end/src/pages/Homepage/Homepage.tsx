import { TitleCard } from "@components/titleCard/titleCard"
import { PresetList } from "@components/presetList/PresetList"
import { Footer } from "@components/Footer/Footer"
import styles from "./Homepage.module.scss"
import { ChartAnalyzerInformation, ChartFileInformation, ChartInformation, Column, DataViewerPreset, dataColumnKeys } from "@types"
import { useModal } from "../../ModalContext"
import { useNavigate } from "react-router-dom"  // See if this works on Electron

export const Homepage = () => {
  const { openModal } = useModal();
  const navigate = useNavigate();

  const generateChartInformation = (
    fileKeys: string[],
    preset: DataViewerPreset
  ): ChartInformation => {
    const chartInformations: ChartInformation[] = preset.graphs.map((currGraph) => {
      const cols: (Column | null)[] = dataColumnKeys.map((key, idx) => {
        const axisDef = currGraph.axes[idx];
        if (!axisDef) return null;
        return {
          header: axisDef.axis,
          filename: `${fileKeys[0]}/${axisDef.file}`,
          timespan: { start: null, end: null }
        };
      });
  
      // Destructure cols into x, y, z
      const [x, y, z] = cols;
      // x and y must exist, z can be null
  
      const analyze: ChartAnalyzerInformation = {
        type: currGraph.analyzer,
        analyzerValues: currGraph.analyzerOptions
      };
  
      const fileEntry: ChartFileInformation = { x: x!, y: y!, z: z || null, analyze };
  
      return {
        files: [fileEntry],
        live: false,
        type: currGraph.graphType,
        hasTimestampX: fileEntry.x.header === 'Timestamp (ms)',
        hasGPSTime: fileEntry.x.timespan.start != null
      };
    });
  
    // Return the first chart (extend for multiple if needed)
    return chartInformations[0];
  };
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