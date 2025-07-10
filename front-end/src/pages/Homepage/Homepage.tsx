import { TitleCard } from "@components/titleCard/titleCard"
import { PresetList } from "@components/presetList/PresetList"
import { Footer } from "@components/footer/Footer"
import styles from "./Homepage.module.scss"
import { DataViewerPreset } from "@types"
import { useModal } from "../../ModalContext"
import { useNavigate } from "react-router-dom"  // See if this works on Electron
import { generateChartInformation } from "@lib/chartInformation"

export const Homepage = () => {
  const { openModal } = useModal();
  const navigate = useNavigate();

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