import { useState } from 'react';
import styles from './Dropdown.module.scss';
import {chevronDownIcon} from '@assets/icons';
import cx from 'classnames';

export interface DropdownOption<T> {
  value: T;
  label: string;
}

interface DropdownProps<All, Option extends All> {
  options: DropdownOption<Option>[];
  selected: All;
  setSelected: (selected: Option) => void;
  width?: string;
  className?: string;
}

export const Dropdown = <All,Option extends All>(
  { options, selected, setSelected, width, className }: DropdownProps<All, Option>
) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionClick = (option: Option, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelected(option);
    setIsOpen(false);
  };

  const selectedOption = options.find(option => option.value === selected);

  return (
    <button 
      className={cx(styles.dropdown, {[styles.open]: isOpen}, className)} 
      style={{ width }}
      onClick={() => setIsOpen((prev) => !prev)}
    >
      <div className={styles.dropdownContent}>
        {selectedOption?.label || 'Select an option'}
        <img src={chevronDownIcon} alt="dropdown arrow" className={styles.icon} />
      </div>

      <div className={`${styles.options} ${isOpen ? styles.open : ''}`}>
        {options
          .filter(option => option.value !== selected) // Filter out the selected option, since its already displayed
          .map((option, index) => (
            <div
              key={index}
              className={`${styles.option} ${
                option.value === selected ? styles.selected : ''
              }`}
              onClick={(e) => handleOptionClick(option.value, e)}
            >
              {option.label}
            </div>
          ))}
      </div>
    </button>
  );
};
