import styles from "./graphHeader.module.scss";
import { icons } from "@lib/assets";

interface GraphHeaderProps {
  title: string;
}

export function GraphHeader({ title }: GraphHeaderProps) {
  return (
    <div className={styles.graphHeader}>
      <div className={styles["title"]}>{title}</div> 
      <div className={styles.buttons}>
        <button>
          Configure
          <img className={styles.icon} src={icons['settings']} alt="Settings" /> {/* Settings icon won't work lol */}
        </button>
        <button>
          Share Dashboard
          <img className={styles.icon} src={icons['upload']} alt="Upload" />
        </button>
      </div>
    </div>
  );
}
