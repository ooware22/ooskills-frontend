/**
 * useLandingPage Hook
 * 
 * Fetches all landing page data with smart caching per language.
 * 
 * Features:
 * - Per-language caching (switching languages uses cached data if fresh)
 * - Request deduplication (prevents multiple simultaneous fetches)
 * - Background revalidation on window focus (only if data is stale)
 * - Configurable stale time for cache
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useI18n, Locale } from "@/lib/i18n";
import { publicApi } from "@/services/contentApi";
import type { PublicLandingPageData } from "@/types/content";

interface UseLandingPageResult {
    data: PublicLandingPageData | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

interface CacheEntry {
    data: PublicLandingPageData;
    timestamp: number;
}

// Configuration
const STALE_TIME = 60000; // 1 minute - data is considered fresh for this duration
const REFETCH_COOLDOWN = 5000; // Minimum time between background refetches

// Module-level cache (persists across component remounts)
const cache = new Map<Locale, CacheEntry>();
let currentFetchPromise: Promise<PublicLandingPageData> | null = null;
let currentFetchLocale: Locale | null = null;

export function useLandingPage(): UseLandingPageResult {
    const { locale } = useI18n();
    const currentLocale = locale as Locale;

    // Initialize state from cache if available
    const cachedEntry = cache.get(currentLocale);
    const [data, setData] = useState<PublicLandingPageData | null>(cachedEntry?.data || null);
    const [isLoading, setIsLoading] = useState(!cachedEntry);
    const [error, setError] = useState<string | null>(null);

    const isMounted = useRef(true);
    const lastRefetchTime = useRef<number>(0);

    // Check if cached data is still fresh
    const isCacheFresh = useCallback((entry: CacheEntry | undefined): boolean => {
        if (!entry) return false;
        return Date.now() - entry.timestamp < STALE_TIME;
    }, []);

    const fetchData = useCallback(async (forceRefresh = false, isBackgroundRefetch = false) => {
        // For background refetches, check cooldown
        if (isBackgroundRefetch) {
            const now = Date.now();
            if (now - lastRefetchTime.current < REFETCH_COOLDOWN) {
                return;
            }
        }

        // If not forcing and we have fresh cache, use it
        const cachedEntry = cache.get(currentLocale);
        if (!forceRefresh && isCacheFresh(cachedEntry)) {
            if (isMounted.current && cachedEntry) {
                setData(cachedEntry.data);
                setIsLoading(false);
            }
            return;
        }

        // Deduplicate concurrent requests for the same locale
        if (currentFetchPromise && currentFetchLocale === currentLocale) {
            try {
                const response = await currentFetchPromise;
                if (isMounted.current) {
                    setData(response);
                    setIsLoading(false);
                }
                return;
            } catch {
                // Fall through to make a new request
            }
        }

        // Show loading only on initial load (not background refetches)
        if (!isBackgroundRefetch && !cachedEntry) {
            setIsLoading(true);
        }
        setError(null);

        try {
            // Create and store the promise for deduplication
            currentFetchLocale = currentLocale;
            currentFetchPromise = publicApi.getLandingPage(currentLocale);

            const response = await currentFetchPromise;

            // Update cache
            cache.set(currentLocale, {
                data: response,
                timestamp: Date.now(),
            });
            lastRefetchTime.current = Date.now();

            if (isMounted.current) {
                setData(response);
            }
        } catch (err) {
            console.error("Failed to fetch landing page data:", err);
            if (isMounted.current) {
                setError("Failed to load content");
            }
            // Keep existing cached data on error (graceful degradation)
        } finally {
            currentFetchPromise = null;
            currentFetchLocale = null;
            if (isMounted.current && !isBackgroundRefetch) {
                setIsLoading(false);
            }
        }
    }, [currentLocale, isCacheFresh]);

    // Initial fetch and locale change handling
    useEffect(() => {
        isMounted.current = true;

        // Check cache first
        const cachedEntry = cache.get(currentLocale);
        if (cachedEntry) {
            setData(cachedEntry.data);
            setIsLoading(false);

            // If cache is stale, do a background refresh
            if (!isCacheFresh(cachedEntry)) {
                fetchData(true, true);
            }
        } else {
            // No cache, fetch fresh data
            fetchData(false, false);
        }

        return () => {
            isMounted.current = false;
        };
    }, [currentLocale, fetchData, isCacheFresh]);

    // Background revalidation on window focus
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                const cachedEntry = cache.get(currentLocale);
                // Only refetch if cache is stale
                if (!isCacheFresh(cachedEntry)) {
                    fetchData(true, true);
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [currentLocale, fetchData, isCacheFresh]);

    return {
        data,
        isLoading,
        error,
        refetch: () => fetchData(true, false),
    };
}

export default useLandingPage;
