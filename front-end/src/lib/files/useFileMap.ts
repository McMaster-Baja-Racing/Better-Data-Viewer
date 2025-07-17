import { useMemo } from 'react';
import { useFiles } from './useFiles';
import { findFileByKey } from './filesHelpers';
import { FileInformation } from '@types';

export const useFileMap = () => {
  const { data: files, ...queryResult } = useFiles();
  
  // Create a map for O(1) lookups
  const fileMap = useMemo(() => {
    if (!files) return new Map<string, FileInformation>();
    const map = new Map<string, FileInformation>();
    files.forEach(file => {
      map.set(file.key, file);
    });
    return map;
  }, [files]);

  // Simple lookup function using the map
  const findFile = (key: string): FileInformation | undefined => {
    return fileMap.get(key);
  };

  // Alternative using the array method if you prefer
  const findFileArray = (key: string): FileInformation | undefined => {
    if (!files) return undefined;
    return findFileByKey(files, key);
  };

  return {
    files,
    fileMap,
    findFile,
    findFileArray,
    ...queryResult
  };
};
