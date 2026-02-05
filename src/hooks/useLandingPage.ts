/**
 * useLandingPage Hook
 * 
 * Fetches all landing page data in a single API call for optimal performance.
 * Returns loading, error, and data states.
 */

"use client";

import { useState, useEffect } from "react";
import { useI18n, Locale } from "@/lib/i18n";
import { publicApi } from "@/services/contentApi";
import type { PublicLandingPageData } from "@/types/content";

interface UseLandingPageResult {
    data: PublicLandingPageData | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useLandingPage(): UseLandingPageResult {
    const { locale } = useI18n();
    const [data, setData] = useState<PublicLandingPageData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await publicApi.getLandingPage(locale as Locale);
            setData(response);
        } catch (err) {
            console.error("Failed to fetch landing page data:", err);
            setError("Failed to load content");
            // Keep existing data on error (graceful degradation)
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [locale]);

    return {
        data,
        isLoading,
        error,
        refetch: fetchData,
    };
}

export default useLandingPage;
