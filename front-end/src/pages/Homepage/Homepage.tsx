import { TitleCard } from "@components/titleCard/titleCard"
import { PresetList } from "@components/presetList/PresetList"
import { Footer } from "@components/Footer/Footer"
import styles from "./Homepage.module.scss"
import { DataViewerPreset } from "@types"
import { useModal } from "../../ModalContext"

export const Homepage = () => {
  const { openModal } = useModal();

  // TODO: Either pass this in from parent and pass to graphing page
  // or store in context
  const setBins = (fileKeys: string[]) => {
    console.log(fileKeys);
  }

  const handleClick = (preset: DataViewerPreset) => {
    openModal('preset', {setBins: setBins, preset: preset});
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