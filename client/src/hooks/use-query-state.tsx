import { useState, useCallback, useEffect } from 'react';
import { useLocation, useSearch } from 'wouter';

// Define query parameter interface
interface QueryParams {
  [key: string]: string;
}

export function useQueryState(): [QueryParams, (newParams: QueryParams) => void] {
  const [location, setLocation] = useLocation();
  const search = useSearch();
  
  // Parse current query parameters
  const parseQueryParams = (): QueryParams => {
    const params = new URLSearchParams(search);
    const result: QueryParams = {};
    
    params.forEach((value, key) => {
      result[key] = value;
    });
    
    return result;
  };
  
  const [queryParams, setQueryParamsState] = useState<QueryParams>(parseQueryParams());
  
  // Update query parameters in the URL
  const setQueryParams = useCallback((newParams: QueryParams) => {
    // Create new URLSearchParams object
    const searchParams = new URLSearchParams();
    
    // Add all new parameters to the search params
    Object.entries(newParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, value);
      }
    });
    
    // Get the new search string
    const newSearch = searchParams.toString();
    const newLocation = location.split('?')[0] + (newSearch ? `?${newSearch}` : '');
    
    // Update the URL
    setLocation(newLocation);
    
    // Update the state
    setQueryParamsState(newParams);
  }, [location, setLocation]);
  
  // Update state when URL changes
  useEffect(() => {
    setQueryParamsState(parseQueryParams());
  }, [search]);
  
  return [queryParams, setQueryParams];
}
