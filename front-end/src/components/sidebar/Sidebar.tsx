import { useState } from 'react';
import bajaLogo from '@assets/baja_logo.svg';
import homeIcon from '@assets/icons/home.svg';
import bookmarkIcon from '@assets/icons/bookmark.svg';
import downloadIcon from '@assets/icons/download.svg';
import uploadIcon from '@assets/icons/upload.svg';
import folderIcon from '@assets/icons/folder.svg';
import settingsIcon from '@assets/icons/settings.svg';
import accountIcon from '@assets/icons/account.svg';
import styles from './Sidebar.module.scss'; 
import cx from 'classnames';
import sidebarToggleCollapsed from '@assets/icons/sidebarToggleCollapsed.svg';
import sidebarToggleExpanded from '@assets/icons/sidebarToggleExpanded.svg';
import { onIconClick } from '@lib/navigationUtils';
import { useModal } from '../../ModalContext';

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
    )
}

const Sidebar = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const toggleSidebar = () => setIsExpanded(!isExpanded);
    const { openModal } = useModal();

    return (
        <div className={cx(styles.sidebar, { [styles.expanded]: isExpanded })}>
            <img className={styles.toggleExpanded} onClick={toggleSidebar} src={sidebarToggleExpanded} />
            <img className={styles.toggleCollapsed} onClick={toggleSidebar} src={sidebarToggleCollapsed} />
            <div className={styles.sidebarHeader}>
                <img className={styles.logo} src={bajaLogo} alt="Logo"/>
                <span className={styles.title}>Data Viewer</span>
            </div>
            <div className={styles.bodyHeader}>
                <span className={styles.bodyTitle}>Overview</span>
            </div>
            <div className={styles.bodyItems}>
                <SidebarItem icon={homeIcon} text="Home" onClick={() => onIconClick('')}/>
                <SidebarItem icon={bookmarkIcon} text="Bookmarked" onClick={() => console.log('bookmarked')}/>
                <SidebarItem icon={uploadIcon} text="Upload Data" onClick={() => openModal('upload')}/>
                <SidebarItem icon={downloadIcon} text="Download Data" onClick={() => openModal('download')}/>
                <SidebarItem icon={folderIcon} text="File Browser" onClick={() => console.log('file browser')}/>
            </div>
            <div className={styles.footerHeader}>
                <span className={styles.footerTitle}>Settings</span>
            </div>
            <div className={styles.footerItems}>
                <SidebarItem icon={settingsIcon} text="Settings" onClick={() => console.log('settings')}/>
                <SidebarItem icon={accountIcon} text="My Account" onClick={() => console.log('my account')}/>
            </div>
            
        </div>
    );
}

export default Sidebar;
