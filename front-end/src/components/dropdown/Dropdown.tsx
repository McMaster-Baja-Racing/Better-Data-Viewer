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
  return (
    <div className={styles.dropdownContainer} style={{ width: `${width}` }}>
    <select
      className={styles.dropdown}
      value={selected}
      onChange={(e) => setSelected(e.target.value)}
    >
      {options.map((option, index) => (
        <option key={index} value={option}>
          {option}
        </option>
      ))}
    </select>
    <img src={chevronDown} alt="chevronDown" className={styles.chevronDown} />
  </div>
  );
};
