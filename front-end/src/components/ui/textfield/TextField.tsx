import styles from './TextField.module.scss';
import cx from 'classnames';

interface TextFieldProps {
  title: string;
  value: string;
  setValue: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

const TextField = ({
  title,
  value,
  setValue,
  label,
  placeholder = 'Value',
  className = '',
}: TextFieldProps) => {
  return (
    <div className={cx(styles.textField, className)} >
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
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
    </div>
  );
};

export default TextField;
