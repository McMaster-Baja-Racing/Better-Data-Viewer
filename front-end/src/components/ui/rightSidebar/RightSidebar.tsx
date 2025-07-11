import { useState, useRef } from 'react';
import styles from './RightSidebar.module.scss';
import cx from 'classnames';
import {closeIcon} from '@assets/icons';

const MAX_WIDTH = 1000;
const MIN_WIDTH = 700;

interface RightSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  mainContent: React.ReactNode;
  sidebarContent: React.ReactNode;
}

export const RightSidebar = ({ isOpen, setIsOpen, mainContent, sidebarContent }: RightSidebarProps) => {
  const [width, setWidth] = useState(MIN_WIDTH);
  const isResizing = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;

    const handleMouseMove = (event: MouseEvent) => {
      if (!isResizing.current) return;
      const newWidth = window.innerWidth - event.clientX;
      if (newWidth > MIN_WIDTH && newWidth < MAX_WIDTH) setWidth(newWidth);
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className={styles.rightSidebarContainer}>
      <div className={styles.children}>
        {mainContent}
      </div>
      <div 
        className={cx(styles.rightSidebar, { 
          [styles.collapsed]: !isOpen,
          [styles.isResizing]: isResizing.current
        })}
        style={{ width: `${isOpen ? width : 0}px` }}
      >
        <div className={styles.resizer} onMouseDown={handleMouseDown} />
        <button className={styles.closeButton} onClick={() => setIsOpen(false)}>
          <img src={closeIcon} alt="Close sidebar" />
        </button>
        <div className={styles.sidebarContent}>
          {sidebarContent}
        </div>
      </div>
    </div>
  );
};
