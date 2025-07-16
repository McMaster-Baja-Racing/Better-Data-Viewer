import { FileInformation } from '@types';

export const getFolders = (files: FileInformation[]): string[] => {
  // Extract the folders from the file keys
  const folders: string[] = [];
  files.forEach((file) => {
    const folder = file.key.split('/')[1]; // Get the folder name from the key
    if (folder && !folders.includes(folder)) {
      folders.push(folder);
    }
  });
  return folders;
};