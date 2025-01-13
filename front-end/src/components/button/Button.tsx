import styles from './Button.module.scss';
import cx from 'classnames';

interface ButtonProps {
  onClick: () => void;
  text: string;
  icon?: string;
  primary?: boolean;
  padding_x?: string;
  padding_y?: string;
  text_size?: number;
}

export const Button = ({ onClick, text, icon, primary = true, padding_x, padding_y, text_size }: ButtonProps) => {
  return (
    <button
      className={cx(styles.button, { [styles.primary]: primary })}
      onClick={onClick}
      style={{
        paddingLeft: `${padding_x}`,
        paddingRight: `${padding_x}`,
        paddingTop: `${padding_y}`,
        paddingBottom: `${padding_y}`,
        fontSize: `${text_size}`
      }}
    >
      {text}
      {icon && <img src={icon} alt="icon" />}
    </button>
  );
};