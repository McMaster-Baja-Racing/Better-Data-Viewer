import styles from './Button.module.scss';
import cx from 'classnames';

interface ButtonProps {
  onClick: () => void;
  children?: React.ReactNode;
  primary?: boolean;
  paddingX?: string;
  paddingY?: string;
  textSize?: string;
  className?: string;
}

export const Button = ({ onClick, children, primary = true, paddingX, paddingY, textSize, className }: ButtonProps) => {
  return (
    <button
      className={cx(styles.button, {[styles.primary]: primary}, className)}
      onClick={onClick}
      style={{
        paddingLeft: `${paddingX}`,
        paddingRight: `${paddingX}`,
        paddingTop: `${paddingY}`,
        paddingBottom: `${paddingY}`,
        fontSize: `${textSize}`
      }}
    >
      {children}
    </button>
  );
};