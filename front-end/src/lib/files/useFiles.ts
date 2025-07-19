import { useQuery } from '@tanstack/react-query';
import { FileInformation } from '@types';
import { ApiUtil } from '@lib/apiUtils';

export const useFiles = () => {
  return useQuery<FileInformation[], Error>({
    queryKey: ['files'],        // unique cache key
    queryFn: fetchFiles,        // how to fetch
    staleTime: 1 * 60 * 1000,   // 1 minute
    retry: 1,                   // retry once on failure
    refetchOnWindowFocus: true, // default
    refetchOnReconnect: true,   // default
  });
};

export const fetchFiles = async (): Promise<FileInformation[]> => {
  const response = await ApiUtil.getFolder('csv');
  return response;
};