import styles from './Footer.module.scss';
import bajalogo from '@assets/baja_logo.svg';
import { icons } from '@lib/assets';

export function Footer() { 
  return (
    <div className={styles.footer}>

      <div className={styles['title-group']}>
        <div className={styles.copyright}> © 2024 </div>
        <div className={styles.title}> McMaster Baja Racing </div>
      </div>

      <img src={bajalogo} alt="baja_logo"/>

      <div className={styles.buttons}>
        <a href="https://www.instagram.com/mcmasterbaja" title="Instagram" target="_blank" rel="noopener noreferrer" className={styles.iconLink}>
          <img className={styles.icon} src={icons['instagram']} alt="Instagram" />
        </a>

        <a href="https://www.facebook.com/McMasterBaja" title="Facebook" target="_blank" rel="noopener noreferrer" className={styles.iconLink}>
          <img className={styles.icon} src={icons['facebook']} alt="Facebook" />
        </a>

        <a href="https://www.youtube.com/user/mcmasterbaja" title="YouTube" target="_blank" rel="noopener noreferrer" className={styles.iconLink}>
          <img className={styles.icon} src={icons['youtube']} alt="YouTube" />
        </a>

        <a href="https://www.linkedin.com/company/mcmasterbaja/" title="LinkedIn" target="_blank" rel="noopener noreferrer" className={styles.iconLink}>
          <img className={styles.icon} src={icons['linkedin']} alt="LinkedIn" />
        </a>

        <a href="https://x.com/mcmaster_baja" title="Twitter" target="_blank" rel="noopener noreferrer" className={styles.iconLink}>
          <img className={styles.icon} src={icons['twitter']} alt="Twitter" />
        </a>
      </div>
    </div>
  );
};
