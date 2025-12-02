import { useState, useEffect } from 'react';
import { getDropdownOptions, getBatchDropdownOptions } from '@/lib/api';
import { IDropdownOption } from '@/models/dropdown-option';

interface UseDropdownOptionsReturn {
  options: IDropdownOption[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch dropdown options for a specific category
 */
export function useDropdownOptions(category: string): UseDropdownOptionsReturn {
  const [options, setOptions] = useState<IDropdownOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDropdownOptions(category);
      if (response.success) {
        setOptions(response.data);
      } else {
        setError('Failed to fetch dropdown options');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (category) {
      fetchOptions();
    }
  }, [category]);

  return {
    options,
    loading,
    error,
    refetch: fetchOptions,
  };
}

interface UseBatchDropdownOptionsReturn {
  data: Record<string, IDropdownOption[]>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch multiple dropdown categories at once
 */
export function useBatchDropdownOptions(categories: string[]): UseBatchDropdownOptionsReturn {
  const [data, setData] = useState<Record<string, IDropdownOption[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getBatchDropdownOptions(categories);
      if (response.success) {
        setData(response.data);
      } else {
        setError('Failed to fetch dropdown options');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (categories.length > 0) {
      fetchOptions();
    }
  }, [categories.join(',')]);

  return {
    data,
    loading,
    error,
    refetch: fetchOptions,
  };
}

/**
 * Utility function to create a mapping of value to label for dropdown options
 */
export function createOptionMap(options: IDropdownOption[]): Record<string, string> {
  return options.reduce((acc, option) => {
    acc[option.value] = option.label;
    return acc;
  }, {} as Record<string, string>);
}

/**
 * Utility function to get option label by value
 */
export function getOptionLabel(options: IDropdownOption[], value: string): string {
  const option = options.find(opt => opt.value === value);
  return option ? option.label : value;
}

/**
 * Utility function to get option by value
 */
export function getOptionByValue(options: IDropdownOption[], value: string): IDropdownOption | undefined {
  return options.find(opt => opt.value === value);
}
