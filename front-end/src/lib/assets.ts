import deleteIcon from '../assets/icons/delete.svg';
import downloadIcon from '../assets/icons/download.svg';
import folderIcon from '../assets/icons/folder.svg';
import helpIcon from '../assets/icons/help.svg';
import liveOffIcon from '../assets/icons/liveOff.svg';
import liveOnIcon from '../assets/icons/liveOn.svg';
import mapIcon from '../assets/icons/map.svg';
import newGraphIcon from '../assets/icons/newGraph.svg';
import newGraph2Icon from '../assets/icons/newGraph2.svg';
import uploadIcon from '../assets/icons/upload.svg';

import accelImage from '../assets/help/accel.png';
import interpolateImage from '../assets/help/interpolate.png';
import linearMultiplier from '../assets/help/linMult.png';
import RdpGif from '../assets/help/rdp.gif';
import RdpImage from '../assets/help/rdp.png';
import rollAvgImage from '../assets/help/rollAvg.png';
import savitzkyGolayGif from '../assets/help/sgolay.gif';
import splitImage from '../assets/help/split.png';

export const icons: Record<string, string> = {
  delete: deleteIcon,
  download: downloadIcon,
  folder: folderIcon,
  help: helpIcon,
  liveOff: liveOffIcon,
  liveOn: liveOnIcon,
  map: mapIcon,
  newGraph: newGraphIcon,
  newGraph2: newGraph2Icon,
  upload: uploadIcon,
};

export const images: Record<string, string> = {
  accel: accelImage,
  interpolate: interpolateImage,
  linearMultiplier: linearMultiplier,
  rdp: RdpImage,
  rdpGif: RdpGif,
  rollingAverage: rollAvgImage,
  sGolay: savitzkyGolayGif,
  split: splitImage,
};