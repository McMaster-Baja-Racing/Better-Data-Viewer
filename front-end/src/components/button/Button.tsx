import styles from './Button.module.scss';
import cx from 'classnames';

interface ButtonProps {
  onClick: () => void;
  children?: React.ReactNode;
  primary?: boolean;
  paddingX?: string;
  paddingY?: string;
  textSize?: string;
  disabled?: boolean;
  className?: string;
}

export const Button = ({
  onClick,
  children,
  primary = true,
  paddingX = '1.5rem',
  paddingY = '0.75rem',
  textSize = '1rem',
  disabled = false,
  className,
}: ButtonProps) => {
  return (
    <button
      className={cx(styles.button, { [styles.primary]: primary }, className)}
      onClick={onClick}
      disabled={disabled}
      style={{
        paddingLeft: paddingX,
        paddingRight: paddingX,
        paddingTop: paddingY,
        paddingBottom: paddingY,
        fontSize: textSize,
      }}
    >
      {children}
    </button>
  );
};
