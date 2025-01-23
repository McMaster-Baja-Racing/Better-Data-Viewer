import styles from './Sidebar.module.scss';
import cx from 'classnames';
import { useState } from 'react';
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
        onClick?: () => void;
    }

    // Defines the sidebar item component function and styling
    const SidebarItem = ({ icon, text, onClick }: SidebarItemProps) => {
        return (
            <button className={styles.item} onClick={onClick}>
                <div className={styles.iconContainer}>
                    <img className={styles.icon} src={icon} />
                </div>
                <span className={styles.text}>{text}</span>
            </button>
        )
    }

    const [isOpen, setIsOpen] = useState(false);
    const toggleSidebar = () => setIsOpen(!isOpen);

    return (
        <div className={cx(styles.sidebar, { [styles.open]: isOpen })}>
            <div className={styles.header} onClick={toggleSidebar}>
                <img className={styles.logo} src={bajaLogo} />
                <span className={styles.title}>DATA VIEWER</span>
            </div>
            <div className={styles.body}>
                <div className={styles.section}>
                    <span className={styles.sectionTitle}>OVERVIEW</span>
                </div>
                <SidebarItem icon={homeIcon} text="Home" onClick={() => console.log('home')} />
                <SidebarItem icon={bookmarkIcon} text="Bookmarked" onClick={() => console.log('bookmarked')}/>
                <SidebarItem icon={downloadIcon} text="Download Data" onClick={() => console.log('download data')}/>
                <SidebarItem icon={folderIcon} text="File Browser" onClick={() => console.log('file browser')}/>
                <SidebarItem icon={uploadIcon} text="Upload Data" onClick={() => console.log('upload data')}/>
            </div>
            <div className={styles.footer}>
            <div className={styles.section}>
                    <span className={styles.sectionTitle}>ACCOUNT</span>
                </div>
                <SidebarItem icon={settingsIcon} text="Settings" onClick={() => console.log('settings')}/>
                <SidebarItem icon={accountIcon} text="My Account" onClick={() => console.log('my account')}/>
            </div>
        </div>
    )
}

export default Sidebar;