import { Button } from '@components/ui/button/Button';
import styles from './emptyGraph.module.scss';

interface EmptyGraphProps {
  onEditClick: () => void;
}

export const EmptyGraph = ({ onEditClick }: EmptyGraphProps) => {
  return (
    <div className={styles.emptyState}>
      <h2 className={styles.emptyStateHeading}>
        Create Your Graph
      </h2>
      <p className={styles.emptyStateDescription}>
        Get started by selecting data sources from the sidebar to visualize your data.
      </p>
      <Button
        paddingY={'0.5rem'}
        onClick={onEditClick}
      >
        Edit Graph
      </Button>
    </div>
  );
};