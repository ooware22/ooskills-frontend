/**
 * useServerWakeUp
 *
 * Prevents the hosted backend (e.g. Render free tier) from cold-starting mid-request
 * by sending a lightweight ping before the first real request, and every 5 minutes
 * while the tab is open.
 *
 * Smart guard: if there are already real API requests in-flight when the interval
 * fires, the ping is skipped — the server is clearly already awake.
 */

'use client';

import { useEffect } from 'react';
import { API_BASE_URL, getActiveRequestCount } from '@/lib/axios';

/** How often to re-ping (ms). 5 minutes keeps most free-tier servers alive. */
const PING_INTERVAL_MS = 5 * 60 * 1000;

/** Timeout for the ping itself — we don't want to wait a whole minute. */
const PING_TIMEOUT_MS = 15_000;

async function pingServer(): Promise<void> {
    // If real requests are already happening, the server is awake — skip.
    if (getActiveRequestCount() > 0) return;

    const controller = new AbortController();
    const timerId = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);

    try {
        await fetch(`${API_BASE_URL}/ping/`, {
            method: 'GET',
            signal: controller.signal,
            // No credentials, no auth — pure lightweight ping
            cache: 'no-store',
        });
    } catch {
        // Ignore errors — if the server is truly down we can't do anything here.
        // The real error handling is in the axios interceptor for actual requests.
    } finally {
        clearTimeout(timerId);
    }
}

export function useServerWakeUp(): void {
    useEffect(() => {
        // Immediate ping on first render (page load / tab focus)
        pingServer();

        // Periodic ping to stay warm
        const intervalId = setInterval(pingServer, PING_INTERVAL_MS);

        return () => clearInterval(intervalId);
    }, []);
}
