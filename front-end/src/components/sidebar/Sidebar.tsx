import styles from './Sidebar.module.scss';
import { onIconClick } from '@lib/navigationUtils';
import bajaLogo from '@assets/baja_logo.svg'
import homeIcon from '@assets/icons/home.svg';
import bookmarkIcon from '@assets/icons/bookmark.svg';
import downloadIcon from '@assets/icons/download.svg';
import uploadIcon from '@assets/icons/upload.svg';
import folderIcon from '@assets/icons/folder.svg';
import settingsIcon from '@assets/icons/settings.svg';
import accountIcon from '@assets/icons/account.svg';

const Sidebar = () => {
    // Defines the image, text and linked path for a sidebar item
    interface SidebarItemProps {
        icon: string;
        text: string;
        link?: string;
    }

    // Defines the sidebar item component function and styling
    const SidebarItem = ({ icon, text, link }: SidebarItemProps) => {
        return (
            <button className={styles.item} onClick={() => { if(link) onIconClick(link) }}>
                <img className={styles.icon} src={icon} />
                <span className={styles.text}>{text}</span>
            </button>
        )
    }

    return (
        <div className={styles.sidebar}>
            <div className={styles.header}>
                <img className={styles.logo} src={bajaLogo} />
                <span className={styles.title}>Data Viewer</span>
            </div>
            <div className={styles.body}>
                <div className={styles.section}>
                    <span className={styles.sectionTitle}>Overview</span>
                </div>
                <SidebarItem icon={homeIcon} text="Home" link="" />
                <SidebarItem icon={bookmarkIcon} text="Bookmarked"/>
                <SidebarItem icon={downloadIcon} text="Download Data"/>
                <SidebarItem icon={folderIcon} text="File Browser"/>
                <SidebarItem icon={uploadIcon} text="Upload Data"/>
            </div>
            <div className={styles.footer}>
            <div className={styles.section}>
                    <span className={styles.sectionTitle}>Account</span>
                </div>
                <SidebarItem icon={settingsIcon} text="Settings"/>
                <SidebarItem icon={accountIcon} text="My Account"/>
            </div>
        </div>
    )
}

export default Sidebar;