import { PresetCard } from "./presetCard/PresetCard";
import { subteamGraphPresets } from "@lib/subteamGraphPresets";
import styles from './PresetList.module.scss';
import { DataViewerPreset } from "@types";

interface PresetListProps {
  handleClick: (preset: DataViewerPreset) => void;
}

export const PresetList = ({ handleClick }: PresetListProps) => {

  return (
    <div className={styles.presetListWrapper}>
      <h2 className={styles.title}>Presets</h2>
      <div className={styles.presetList}>
        {subteamGraphPresets.map((preset) => (
          <PresetCard key={preset.name} {...preset} fileCount={1} onClick={() => {handleClick(preset)}}/>
        ))}
      </div>
    </div>
  );
}