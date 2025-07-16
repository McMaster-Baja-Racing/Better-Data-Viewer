import { useQuery } from '@tanstack/react-query';
import { fetchFiles } from './files';
import { FileInformation } from '@types';

export const useFiles = () => {
  return useQuery<FileInformation[], Error>({
    queryKey: ['files'],      // unique cache key
    queryFn: fetchFiles,      // how to fetch
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,                 // retry once on failure
  });
};