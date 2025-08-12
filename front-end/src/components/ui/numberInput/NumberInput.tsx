import React from 'react';
import styles from './NumberInput.module.scss';

interface NumberInputProps {
  label: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  min,
  max,
  step = 1,
  unit = ''
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      onChange(undefined);
    } else {
      const numVal = Number(val);
      if (!isNaN(numVal)) {
        onChange(numVal);
      }
    }
  };

  return (
    <div className={styles.numberInputContainer}>
      <label className={styles.label}>{label}</label>
      <div className={styles.inputContainer}>
        <input
          type="number"
          value={value !== undefined ? value : ''}
          onChange={handleChange}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          className={styles.input}
        />
        {unit && <span className={styles.unit}>{unit}</span>}
      </div>
    </div>
  );
};
