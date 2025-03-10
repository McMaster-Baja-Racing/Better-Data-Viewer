import { TitleCard } from "@components/titleCard/titleCard"
import { PresetList } from "@components/presetList/PresetList"
import { Footer } from "@components/Footer/Footer"
import styles from "./Homepage.module.scss"

export const Homepage = () => {

  return (
    <div className={styles.homepage}>
      <TitleCard />
      <div className={styles.body}>
        <PresetList />
      </div>
      <div className={styles.footerWrapper}>
        <Footer />
      </div>
      
    </div>
  )

}