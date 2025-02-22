import { useState } from "react";
import styles from "./Accordion.module.scss";
import { icons } from "@lib/assets";
import cx from "classnames";

interface AccordionProps {
  readonly title: string;
  readonly children: React.ReactNode;
}

export function Accordion({ title, children }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={styles.accordion}>
      <button
        className={styles.header}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <img
          src={icons.chevronDown}
          alt="Toggle"
          className={cx(styles.arrow, { [styles.open]: isOpen })}
        />
        <span className={styles.title}>{title}</span>
      </button>
      <div className={`${styles.content} ${isOpen ? styles.expanded : ""}`}>
        {children}
      </div>
    </div>
  );
}
