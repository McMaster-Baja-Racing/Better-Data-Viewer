import { useState, useRef } from 'react';
import styles from './RightSidebar.module.scss';
import cx from 'classnames';

interface RightSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  mainContent: React.ReactNode;
  sidebarContent: React.ReactNode;
}

export const RightSidebar = ({ isOpen, setIsOpen, mainContent, sidebarContent }: RightSidebarProps) => {
  const [width, setWidth] = useState(500);
  const isResizing = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;

    const handleMouseMove = (event: MouseEvent) => {
      if (!isResizing.current) return;
      const newWidth = window.innerWidth - event.clientX;
      if (newWidth > 300 && newWidth < 1250) setWidth(newWidth); // Limit resize range
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className={styles.rightSidebarContainer}>
      <div className={styles.children}>
        {mainContent}
      </div>
      <div 
        className={cx(styles.rightSidebar, { [styles.collapsed]: !isOpen })}
        style={{ width: `${isOpen ? width : 0}px` }}
      >
        <div className={styles.resizer} onMouseDown={handleMouseDown} />
        {sidebarContent}
      </div>
    </div>
  )
}