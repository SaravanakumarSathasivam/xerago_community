import { useState, useEffect } from 'react';
import { getDropdownOptions, getBatchDropdownOptions } from '@/lib/api';

interface DropdownOption {
  _id: string;
  category: string;
  value: string;
  label: string;
  description?: string;
  order: number;
  isActive: boolean;
  metadata?: {
    color?: string;
    icon?: string;
    parentCategory?: string;
  };
}

interface UseDropdownOptionsReturn {
  options: DropdownOption[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch dropdown options for a specific category
 */
export function useDropdownOptions(category: string): UseDropdownOptionsReturn {
  const [options, setOptions] = useState<DropdownOption[]>([]);
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
  data: Record<string, DropdownOption[]>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch multiple dropdown categories at once
 */
export function useBatchDropdownOptions(categories: string[]): UseBatchDropdownOptionsReturn {
  const [data, setData] = useState<Record<string, DropdownOption[]>>({});
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
export function createOptionMap(options: DropdownOption[]): Record<string, string> {
  return options.reduce((acc, option) => {
    acc[option.value] = option.label;
    return acc;
  }, {} as Record<string, string>);
}

/**
 * Utility function to get option label by value
 */
export function getOptionLabel(options: DropdownOption[], value: string): string {
  const option = options.find(opt => opt.value === value);
  return option ? option.label : value;
}

/**
 * Utility function to get option by value
 */
export function getOptionByValue(options: DropdownOption[], value: string): DropdownOption | undefined {
  return options.find(opt => opt.value === value);
}
