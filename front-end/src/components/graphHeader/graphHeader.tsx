import styles from "./graphHeader.module.scss";
import { icons } from "@lib/assets";

interface GraphHeaderProps {
  title: string;
}

export function GraphHeader({ title }: GraphHeaderProps) {
  return (
    <div className={styles.graphHeader}>
      <div className={styles["title"]}>Drivetrain Preset</div>
      <div className={styles.buttons}>
        <button>
          Configure
          <img
                src={icons.settings} 
                alt="Settings Icon" 
                className={styles.icon} 
            />
        </button>
        <button>
          Share Dashboard
            <img
                src={icons.upload} 
                alt="Upload Icon" 
                className={styles.icon} 
            />
        </button>
      </div>
    </div>
  );
}
