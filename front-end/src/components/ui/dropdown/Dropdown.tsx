import { useId } from 'react';
import styles from './Dropdown.module.scss';
import {chevronDownIcon} from '@assets/icons';
import cx from 'classnames';
import { useDropdown } from '@contexts/DropdownContext';

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
  const { openDropdownId, setOpenDropdown } = useDropdown();
  const id = useId();
  const isOpen = openDropdownId === id;
  const selectedOption = options.find(option => option.value === selected);

  return (
    <button 
      className={cx(styles.dropdown, { [styles.open]: isOpen }, className)} 
      style={{ width }}
      onClick={() => setOpenDropdown(isOpen ? null : id)}
    >
      <div className={styles.dropdownContent}>
        {selectedOption?.label || 'Select an option'}
        <img src={chevronDownIcon} alt="dropdown arrow" className={styles.icon} />
      </div>

      <div className={cx(styles.options, { [styles.open]: isOpen })}>
        {options
          .filter(option => option.value !== selected)
          .map((option, index) => (
            <div
              key={index}
              className={styles.option}
              onClick={(e) => {
                e.stopPropagation();
                setSelected(option.value);
                setOpenDropdown(null);
              }}
            >
              {option.label}
            </div>
          ))}
      </div>
    </button>
  );
};
