import { useState } from 'react';
import styles from './Dropdown.module.scss';
import chevronDown from '@assets/icons/chevronDown.svg';

interface DropdownProps {
  options: string[];
  selected: string;
  setSelected: (selected: string) => void;
  width?: string;
}

// Use select dropdown
export const Dropdown = ({ options, selected, setSelected, width }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionClick = (option: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelected(option);
    setIsOpen(false);
  };

  return (
    <div 
      className={styles.dropdown} 
      style={{ width }}
      onClick={() => setIsOpen((prev) => !prev)}
    >
      <div className={styles.dropdownContent}>
        {selected}
        <img src={chevronDown} alt="chevronDown" className={styles.icon} />
      </div>

      {isOpen && (
        <div className={styles.options}>
          {options
            .filter(option => option !== selected) // Filter out the selected option
            .map((option, index) => (
              <div
                key={index}
                className={`${styles.option} ${
                  option === selected ? styles.selected : ''
                }`}
                onClick={(e) => handleOptionClick(option, e)}
              >
                {option}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};