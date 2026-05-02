/**
 * In-memory access token store.
 *
 * Security model:
 * - Access token: held in a JS variable (short-lived, 60min, never written to any storage).
 * - Refresh token: lives in an HttpOnly cookie set/rotated by the backend.
 *   JS cannot read or modify it — eliminates persistent token theft via XSS.
 *
 * `has_session` is a non-secret sessionStorage flag used only for UI hints
 * (e.g. showing the user as logged-in after page reload until the first
 * silent-refresh either succeeds or fails).
 */

let _accessToken: string | null = null;

/** Returns the current in-memory access token, or null if not set. */
export const getAccessToken = (): string | null => _accessToken;

/** Stores a new access token in memory. Pass null to clear. */
export const setAccessToken = (token: string | null): void => {
    _accessToken = token;
};

/** Mark that a session exists (non-secret UI hint, not the token itself). */
export const markSessionActive = (): void => {
    if (typeof window !== 'undefined') {
        sessionStorage.setItem('has_session', '1');
    }
};

/**
 * Returns true when the user likely has an active session.
 * After a page reload the in-memory access token is gone, but `has_session`
 * survives until the tab is closed or an explicit logout clears it.
 */
export const hasSession = (): boolean => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('has_session') === '1';
};

/** Clear the in-memory token and the session marker. */
export const clearAllTokens = (): void => {
    _accessToken = null;
    if (typeof window !== 'undefined') {
        sessionStorage.removeItem('has_session');
    }
};
