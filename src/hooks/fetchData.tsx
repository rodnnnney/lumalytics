import { useState, useEffect, useRef, useCallback } from "react";

export const useFetch = <T,>(
  fetchFunction: () => Promise<T>,
  autoFetch = true,
  initialData: T | null = null
) => {
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(autoFetch); // Start as true if autoFetch is true
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);
  const fetchFunctionRef = useRef(fetchFunction);

  // Update the ref if fetchFunction changes
  useEffect(() => {
    fetchFunctionRef.current = fetchFunction;
  }, [fetchFunction]);

  const fetchData = useCallback(async () => {
    if (!isMounted.current) return;

    try {
      setLoading(true);
      setError(null);

      const result = await fetchFunctionRef.current();

      if (isMounted.current) {
        setData(result);
        setLoading(false);
      }
    } catch (e) {
      if (isMounted.current) {
        setError(e instanceof Error ? e : new Error("An error occurred."));
        setLoading(false);
      }
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  useEffect(() => {
    // Reset mounted state to true when hook is initialized
    isMounted.current = true;

    if (autoFetch) {
      fetchData();
    }

    return () => {
      isMounted.current = false;
    };
  }, []); // Remove fetchFunction from dependencies

  return { data, loading, error, refetch: fetchData, reset };
};
