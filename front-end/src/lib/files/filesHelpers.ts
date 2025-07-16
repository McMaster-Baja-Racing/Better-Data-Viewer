import { FileInformation } from '@types';

export const getFolders = (files: FileInformation[]): FileInformation[] => {
  // Extract the folders from the files' keys and build a mock FileInformation array
  const folders: FileInformation[] = [];
  const folderMap = new Map<string, FileInformation>();

  files.forEach((file) => {
    const parts = file.key.split('/');
    for (let i = 0; i < parts.length; i++) {
      const folderKey = parts.slice(0, i + 1).join('/');
      if (!folderMap.has(folderKey)) {
        folderMap.set(folderKey, {
          key: folderKey,
          name: parts[i],
          extension: '',
          size: 0,
          headers: [],
          date: new Date(),
        });
      }
    }
    // Add file size to all parent folders
    for (let i = 0; i < parts.length - 1; i++) {
      const folderKey = parts.slice(0, i + 1).join('/');
      const folder = folderMap.get(folderKey);
      if (folder) {
        folder.size += file.size;
      }
    }
  });

  // Only return top-level folders
  folderMap.forEach((folder, key) => {
    if (!key.includes('/')) {
      folders.push(folder);
    }
  });

  return folders;
};