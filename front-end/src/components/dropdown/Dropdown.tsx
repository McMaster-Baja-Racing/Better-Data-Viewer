import { useState } from 'react';
import styles from './Dropdown.module.scss';
import chevronDown from '@assets/icons/chevronDown.svg';

export interface DropdownOption<T> {
  value: T;
  label: string;
}

interface DropdownProps<T> {
  options: DropdownOption<T>[];
  selected: T;
  setSelected: (selected: T) => void;
  width?: string;
}

// Use select dropdown
export const Dropdown = <T,>({ options, selected, setSelected, width }: DropdownProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionClick = (option: T, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelected(option);
    setIsOpen(false);
  };

  const selectedOption = options.find(option => option.value === selected);

  return (
    <div 
      className={`${styles.dropdown} ${isOpen ? styles.open : ''}`} 
      style={{ width }}
      onClick={() => setIsOpen((prev) => !prev)}
    >
      <div className={styles.dropdownContent}>
        {selectedOption?.label || 'Select an option'}
        <img src={chevronDown} alt="dropdown arrow" className={styles.icon} />
      </div>

      <div className={`${styles.options} ${isOpen ? styles.open : ''}`}>
        {options
          .filter(option => option.value !== selected) // Filter out the selected option
          .map((option, index) => (
            <div
              key={index}
              className={`${styles.option} ${
                option === selected ? styles.selected : ''
              }`}
              onClick={(e) => handleOptionClick(option.value, e)}
            >
              {option.label}
            </div>
          ))}
      </div>
    </div>
  );
};
