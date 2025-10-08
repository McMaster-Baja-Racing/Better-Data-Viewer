import { useState, useEffect } from 'react';
import bajaLogo from '@assets/baja_logo.svg';
import {
  homeIcon,
  downloadIcon,
  uploadIcon,
  trashIcon,
  settingsIcon,
  accountIcon,
  cubeIcon,
  mapIcon,
  sidebarToggleCollapsedIcon,
  sidebarToggleExpandedIcon,
  newGraphIcon, 
} from '@assets/icons';
import styles from './Sidebar.module.scss'; 
import cx from 'classnames';
import { onIconClick } from '@lib/navigationUtils';
import { useModal } from '@contexts/ModalContext';
import { ApiUtil } from '@lib/apiUtils';
import { showErrorToast, showSuccessToast } from '@components/ui/toastNotification/ToastNotification';

// Sidebar item definition
interface SidebarItemProps {
    icon: string;
    text: string;
    onClick?: () => void;
}

// Sidebar item component
const SidebarItem = ({ icon, text, onClick }: SidebarItemProps) => {
  return (
    <button className={styles.sidebarItem} onClick={onClick}>
      <div className={styles.iconContainer}>
        <img className={styles.icon} src={icon} alt="Icon" />
      </div>
      <span className={styles.text}>{text}</span>
    </button>
  );
};

const deleteAllFiles = async () => {
  const res = await ApiUtil.deleteAllFiles();

  if (res.ok) {
    showSuccessToast('All files deleted successfully');
  } else {
    showErrorToast('Something went wrong... sorry');
  }
};

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleSidebar = () => setIsExpanded(!isExpanded);
  const { openModal } = useModal();

  // Set global CSS variable for left sidebar width
  useEffect(() => {
    document.documentElement.style.setProperty('--left-sidebar-width', isExpanded ? '18rem' : '4rem');
  }, [isExpanded]);

  // Initialize the CSS variable on mount
  useEffect(() => {
    document.documentElement.style.setProperty('--left-sidebar-width', '4rem');
  }, []);

  return (
    <div 
      className={cx(styles.sidebar, { [styles.expanded]: isExpanded })}
      style={{ 
        '--left-sidebar-width': isExpanded ? '18rem' : '4rem'
      } as React.CSSProperties}
    >
      <img className={styles.toggleExpanded} onClick={toggleSidebar} src={sidebarToggleExpandedIcon} />
      <img className={styles.toggleCollapsed} onClick={toggleSidebar} src={sidebarToggleCollapsedIcon} />
      <div className={styles.sidebarHeader}>
        <img className={styles.logo} src={bajaLogo} alt="Logo"/>
        <span className={styles.title}>Data Viewer</span>
      </div>
      <div className={styles.bodyHeader}>
        <span className={styles.bodyTitle}>Overview</span>
      </div>
      <div className={styles.bodyItems}>
        <SidebarItem icon={homeIcon} text="Home" onClick={() => onIconClick('')}/>
        {/* <SidebarItem icon={bookmarkIcon} text="Bookmarked" onClick={() => console.log('bookmarked')}/> */}
        <SidebarItem icon={uploadIcon} text="Upload Data" onClick={() => openModal('upload')}/>
        <SidebarItem icon={downloadIcon} text="Download Data" onClick={() => openModal('download')}/>
        <SidebarItem icon={newGraphIcon} text="View Data" onClick={() => onIconClick('dataview')}/>
        {/* <SidebarItem icon={folderIcon} text="File Browser" onClick={() => console.log('file browser')}/> */}
        <SidebarItem icon={cubeIcon} text="Model Viewer" onClick={() => onIconClick('IMU')}/>
        <SidebarItem icon={mapIcon} text="Map" onClick={() => onIconClick('map')}/>
        {/* <SidebarItem icon={historyIcon} text="Legacy UI" onClick={() => onIconClick('old')}/> */}
        <SidebarItem icon={trashIcon} text="Delete All Files" onClick={() => deleteAllFiles()}/>
      </div>
      <div className={styles.footerHeader}>
        <span className={styles.footerTitle}>Settings</span>
      </div>
      <div className={styles.footerItems}>
        <SidebarItem icon={settingsIcon} text="Settings" onClick={() => {/*console.log('settings')*/}}/>
        <SidebarItem icon={accountIcon} text="My Account" onClick={() => {/*console.log('my account')*/}}/>
      </div>
            
    </div>
  );
};

export default Sidebar;
