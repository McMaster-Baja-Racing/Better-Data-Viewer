import styles from './Button.module.scss';
import cx from 'classnames';

interface ButtonProps {
  onClick: () => void;
  text: string;
  icon?: string;
  primary?: boolean;
  paddingX?: string;
  paddingY?: string;
  textSize?: number;
}

export const Button = ({ onClick, text, icon, primary = true, paddingX, paddingY, textSize }: ButtonProps) => {
  return (
    <button
      className={cx(styles.button, { [styles.primary]: primary })}
      onClick={onClick}
      style={{
        paddingLeft: `${paddingX}`,
        paddingRight: `${paddingX}`,
        paddingTop: `${paddingY}`,
        paddingBottom: `${paddingY}`,
        fontSize: `${textSize}`
      }}
    >
      {text}
      {icon && <img src={icon} alt="icon" />}
    </button>
  );
};