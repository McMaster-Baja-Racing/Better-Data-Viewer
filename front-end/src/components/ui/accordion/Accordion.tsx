import { useState, useRef, useEffect } from 'react';
import styles from './Accordion.module.scss';
import {chevronDownIcon} from '@assets/icons';
import cx from 'classnames';

interface AccordionProps {
  readonly title: string;
  readonly children: React.ReactNode;
}

export function Accordion({ title, children }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState('0px');

  useEffect(() => {
    if (isOpen && contentRef.current) {
      setContentHeight(`${contentRef.current.scrollHeight}px`);
    } else {
      setContentHeight('0px');
    }
  }, [isOpen]);

  return (
    <div className={styles.accordion}>
      <button
        className={styles.header}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
      >
        <img
          src={chevronDownIcon}
          alt="Toggle"
          className={cx(styles.arrow, { [styles.open]: isOpen })}
        />
        <span className={styles.title}>{title}</span>
      </button>
      <div
        ref={contentRef}
        className={cx(styles.content, { [styles.expanded]: isOpen })}
        style={{
          maxHeight: contentHeight,
        }}
      >
        {children}
      </div>
    </div>
  );
}
