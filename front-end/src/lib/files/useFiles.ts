import { useQuery } from '@tanstack/react-query';
import { FileInformation, getDataTypes } from '@types';
import { ApiUtil } from '@lib/apiUtils';
import { useMemo } from 'react';

export const useFiles = () => {
  const queryResult = useQuery<FileInformation[], Error>({
    queryKey: ['files'],        // unique cache key
    queryFn: fetchFiles,        // how to fetch
    staleTime: 1 * 60 * 1000,   // 1 minute
    retry: 1,                   // retry once on failure
    refetchOnWindowFocus: true, // default
    refetchOnReconnect: true,   // default
  });

  // Create a map of source -> dataTypes for O(1) lookups
  const dataTypeMap = useMemo(() => {
    const map = new Map<string, string[]>();
    if (!queryResult.data) return map;
    
    // Get all unique sources from files
    const sources = new Set<string>();
    queryResult.data.forEach(file => {
      const parts = file.key.split('/');
      for (let i = 0; i < parts.length; i++) {
        sources.add(parts.slice(0, i + 1).join('/'));
      }
    });
    
    // Build map for each source
    sources.forEach(source => {
      map.set(source, getDataTypes(queryResult.data, source));
    });
    
    return map;
  }, [queryResult.data]);

  return {
    ...queryResult,
    dataTypeMap
  };
};

export const fetchFiles = async (): Promise<FileInformation[]> => {
  const response = await ApiUtil.getFolder('csv');
  return response;
};