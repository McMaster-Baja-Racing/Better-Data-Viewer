import { ApiUtil } from '@lib/apiUtils';
import { FileInformation } from '@types';

export const fetchFiles = async (): Promise<FileInformation[]> => {
  const response = await ApiUtil.getFolder('csv');
  return response;
};