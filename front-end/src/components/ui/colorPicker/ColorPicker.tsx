import styles from './ColorPicker.module.scss';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  presetColors?: string[];
}

const defaultPresetColors = [
  '#222222', '#444444', '#666666', '#888888', '#aaaaaa', '#cccccc', '#ffffff',
  '#ff0000', '#ff8800', '#ffff00', '#88ff00', '#00ff00', '#00ff88', '#00ffff',
  '#0088ff', '#0000ff', '#8800ff', '#ff00ff', '#ff0088'
];

export const ColorPicker = ({
  label,
  value,
  onChange,
  presetColors = defaultPresetColors
}: ColorPickerProps) => {
  return (
    <div className={styles.colorPickerContainer}>
      <label className={styles.label}>{label}</label>
      <div className={styles.colorInput}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={styles.colorInputField}
        />
        <span className={styles.colorValue}>{value}</span>
      </div>
      <div className={styles.presetColors}>
        {presetColors.map((color) => (
          <button
            key={color}
            className={`${styles.presetColor} ${value === color ? styles.selected : ''}`}
            style={{ backgroundColor: color }}
            onClick={() => onChange(color)}
            title={color}
          />
        ))}
      </div>
    </div>
  );
};
