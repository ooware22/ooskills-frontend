'use client';

import { useServerWakeUp } from '@/hooks/useServerWakeUp';

/**
 * Invisible component that keeps the hosted backend warm.
 * Must be a 'use client' component to use a hook.
 * Rendered once in the root layout — no UI output.
 */
export default function ServerWakeUp() {
    useServerWakeUp();
    return null;
}
