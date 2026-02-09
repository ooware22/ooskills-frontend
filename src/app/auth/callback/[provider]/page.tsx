'use client';

/**
 * OAuth Callback Page
 * 
 * Handles the redirect from Google/Facebook after OAuth consent.
 * Reads the authorization code from URL params, sends it to the backend,
 * and redirects to home on success or signin on error.
 */

import { useEffect, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { socialLogin } from '@/store/slices/authSlice';
import type { AppDispatch } from '@/store';

export default function OAuthCallbackPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const hasProcessed = useRef(false);

    const provider = params.provider as string;

    useEffect(() => {
        // Prevent double execution in React strict mode
        if (hasProcessed.current) return;

        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
            console.error('OAuth error:', error);
            router.replace('/auth/signin?error=oauth_denied');
            return;
        }

        if (!code) {
            router.replace('/auth/signin?error=no_code');
            return;
        }

        if (!provider || !['google', 'facebook'].includes(provider)) {
            router.replace('/auth/signin?error=invalid_provider');
            return;
        }

        hasProcessed.current = true;

        const redirectUri = `${window.location.origin}/auth/callback/${provider}`;

        dispatch(
            socialLogin({
                provider: provider as 'google' | 'facebook',
                code,
                redirect_uri: redirectUri,
            })
        )
            .unwrap()
            .then(() => {
                router.replace('/');
            })
            .catch((err) => {
                console.error('Social login failed:', err);
                router.replace(`/auth/signin?error=social_login_failed`);
            });
    }, [provider, dispatch, router, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">
                    Signing you in...
                </p>
            </div>
        </div>
    );
}
