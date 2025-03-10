import { TitleCard } from "@components/titleCard/titleCard"
import { PresetList } from "@components/presetList/PresetList"
import { Footer } from "@components/Footer/Footer"
import styles from "./Homepage.module.scss"
import { DataViewerPreset } from "@types"
import { PresetFilesModal } from "@components/presetFilesModal/PresetFilesModal"
import { useState } from "react"

export const Homepage = () => {
  const handleClick = (preset: DataViewerPreset) => {
    setPreset(preset);
    setIsOpen(true);
  }

  // TODO: Either pass this in from parent and pass to graphing page
  // or store in context
  const setBins = (fileKeys: string[]) => {
    console.log(fileKeys);
  }

  const [isOpen, setIsOpen] = useState(false);
  const [preset, setPreset] = useState<DataViewerPreset | null>(null);

  return (
    <div className={styles.homepage}>
      <TitleCard />
      <div className={styles.body}>
        <PresetList handleClick={handleClick}/>
      </div>
      <div className={styles.footerWrapper}>
        <Footer />
      </div>
      <PresetFilesModal isOpen={isOpen} onClose={() => setIsOpen(false)} setBins={setBins} preset={preset}/>
    </div>
  )

}