import styles from './TextField.module.scss';

interface TextFieldProps {
  title: string;
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
}

const TextField = ({
  title,
  label,
  placeholder,
  value,
  onChange,
}: TextFieldProps) => {
  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) onChange(e.target.value);
  };

  return (
    <div className={styles.textField}>
      {label && <div className={styles.label}>{label}</div>}
      <div className={styles.container}>
        <div className={styles.title}>
          {title}
        </div>
        <input
          className={styles.input}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleOnChange}
        />
      </div>
    </div>
  );
};

export default TextField;
