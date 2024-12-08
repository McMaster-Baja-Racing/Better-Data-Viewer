import styles from './Views.module.scss';
import newGraphImg from '@assets/icons/newGraph2.svg';
import { viewStyles } from '../viewsConfig';

const Views = ({ viewInformation, setModal, setButtonID, numViews, videoTimestamp, setVideoTimestamp, video }) => {
  return (
    <div className={styles.views} style={viewStyles[numViews]}>
      {Array.from({ length: numViews }).map((_, index) => {
        const { component: Component, props } = viewInformation[index];
        return (
          <div key={index} className={styles.singleView} style={{ gridColumn: viewStyles[numViews].gridColumn[index] }}>
            <Component {...props} video={video} videoTimestamp={videoTimestamp} setVideoTimestamp={setVideoTimestamp} />
            <button 
              title="Create Graph" 
              className={styles.createGraph}
              onClick={() => { setButtonID(index); setModal('Create'); }}
            >
              <img className="icon" src={newGraphImg} alt="Create Graph" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Views;