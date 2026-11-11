/**
 * In-memory access token store.
 *
 * Security model:
 * - Access token: held in a JS variable (short-lived, 15 min, never written to any storage).
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

// Same non-secret hint in localStorage, so it also survives a new tab or the
// return from the payment provider. Without it, a visitor who never signed in
// does not call the refresh endpoint at all (it used to answer 401 on every
// page for anonymous visitors: audit FN-25 / LAN-35).
const SIGNED_IN_HINT = 'ooskills-signed-in';

function safeStorage(kind: 'session' | 'local'): Storage | null {
    try {
        return typeof window === 'undefined' ? null : kind === 'session' ? window.sessionStorage : window.localStorage;
    } catch {
        return null; // storage blocked (privacy mode)
    }
}

/** Mark that a session exists (non-secret UI hint, not the token itself). */
export const markSessionActive = (): void => {
    try {
        safeStorage('session')?.setItem('has_session', '1');
        safeStorage('local')?.setItem(SIGNED_IN_HINT, '1');
    } catch {
        // storage full or blocked: the hint is optional
    }
};

/**
 * Returns true when the user likely has an active session.
 * After a page reload the in-memory access token is gone, but the hint
 * survives until an explicit logout (or a failed refresh) clears it.
 */
export const hasSession = (): boolean => {
    try {
        return safeStorage('session')?.getItem('has_session') === '1'
            || safeStorage('local')?.getItem(SIGNED_IN_HINT) === '1';
    } catch {
        return false;
    }
};

/** Clear the in-memory token and the session marker. */
export const clearAllTokens = (): void => {
    _accessToken = null;
    try {
        safeStorage('session')?.removeItem('has_session');
        safeStorage('local')?.removeItem(SIGNED_IN_HINT);
    } catch {
        // nothing to clear
    }
};
