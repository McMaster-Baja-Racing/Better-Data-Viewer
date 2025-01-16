import styles from './TextField.module.scss';
import cx from 'classnames';

interface TextFieldProps {
  title: string;
  label?: string;
  placeholder?: string;
  textSize?: number;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const TextField = ({
  title,
  label,
  placeholder,
  value,
  onChange,
}: TextFieldProps) => {
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
          onChange={onChange}
        />
      </div>
    </div>
  );
};

export default TextField;
