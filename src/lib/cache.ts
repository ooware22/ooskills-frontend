/**
 * Cache Utilities for Redux Store
 * 
 * Provides utilities for cache management and revalidation strategies
 * in Redux async thunks.
 */

// =============================================================================
// CACHE DURATION CONSTANTS
// =============================================================================

export const CACHE_DURATION = {
    /** 1 minute - for rapidly changing data */
    SHORT: 1 * 60 * 1000,
    /** 5 minutes - default for most content */
    MEDIUM: 5 * 60 * 1000,
    /** 15 minutes - for stable content that rarely changes */
    LONG: 15 * 60 * 1000,
    /** 1 hour - for very stable reference data */
    VERY_LONG: 60 * 60 * 1000,
} as const;

// =============================================================================
// CACHE VALIDATION FUNCTIONS
// =============================================================================

/**
 * Check if cached data is stale based on lastFetched timestamp
 * 
 * @param lastFetched - Timestamp when data was last fetched (Date.now())
 * @param duration - Cache duration in milliseconds
 * @returns true if cache is stale or doesn't exist
 */
export const isCacheStale = (
    lastFetched: number | null | undefined,
    duration: number = CACHE_DURATION.MEDIUM
): boolean => {
    if (!lastFetched) return true;
    return Date.now() - lastFetched > duration;
};

/**
 * Check if data should be fetched (for use in thunk condition)
 * 
 * @param lastFetched - Timestamp when data was last fetched
 * @param loading - Current loading state
 * @param duration - Cache duration in milliseconds
 * @returns true if fetch should proceed
 */
export const shouldFetch = (
    lastFetched: number | null | undefined,
    loading: boolean = false,
    duration: number = CACHE_DURATION.MEDIUM
): boolean => {
    // Don't fetch if already loading
    if (loading) return false;
    // Fetch if cache is stale
    return isCacheStale(lastFetched, duration);
};

/**
 * Create a condition function for createAsyncThunk
 * Prevents duplicate requests and respects cache duration
 * 
 * @example
 * export const fetchData = createAsyncThunk(
 *   "slice/fetchData",
 *   async () => { ... },
 *   { condition: createFetchCondition((state) => state.slice) }
 * );
 */
export const createFetchCondition = <T extends { lastFetched?: number | null; loading?: boolean }>(
    stateSelector: (state: unknown) => T,
    duration: number = CACHE_DURATION.MEDIUM
) => {
    return (_: unknown, { getState }: { getState: () => unknown }): boolean => {
        const sliceState = stateSelector(getState());
        return shouldFetch(sliceState.lastFetched, sliceState.loading, duration);
    };
};

// =============================================================================
// FORCE REFRESH UTILITIES
// =============================================================================

/**
 * Options for fetch thunks
 */
export interface FetchOptions {
    /** Force refresh even if cache is valid */
    forceRefresh?: boolean;
}

/**
 * Check if should fetch with force refresh support
 */
export const shouldFetchWithOptions = (
    lastFetched: number | null | undefined,
    loading: boolean,
    options: FetchOptions = {},
    duration: number = CACHE_DURATION.MEDIUM
): boolean => {
    if (options.forceRefresh) return !loading;
    return shouldFetch(lastFetched, loading, duration);
};

// =============================================================================
// REQUEST DEDUPLICATION
// =============================================================================

const pendingRequests = new Map<string, Promise<unknown>>();

/**
 * Deduplicate concurrent requests with the same key
 * Returns existing promise if request is already in flight
 * 
 * @example
 * const data = await deduplicateRequest('hero-fetch', () => api.getHero());
 */
export const deduplicateRequest = async <T>(
    key: string,
    requestFn: () => Promise<T>
): Promise<T> => {
    // Check if request is already pending
    const pending = pendingRequests.get(key);
    if (pending) {
        return pending as Promise<T>;
    }

    // Start new request
    const request = requestFn().finally(() => {
        pendingRequests.delete(key);
    });

    pendingRequests.set(key, request);
    return request;
};

/**
 * Clear all pending requests (useful for cleanup)
 */
export const clearPendingRequests = (): void => {
    pendingRequests.clear();
};
