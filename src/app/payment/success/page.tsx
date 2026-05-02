"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import axiosClient from "@/lib/axios";
import { useAppDispatch } from "@/store/hooks";
import { initializeAuth } from "@/store/slices/authSlice";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const orderId = searchParams.get("order");
  const courseSlug = searchParams.get("course");
  const [verifying, setVerifying] = useState(Boolean(orderId));
  const [authReady, setAuthReady] = useState(false);
  const [verificationMsg, setVerificationMsg] = useState(
    "Verifying your enrollment...",
  );

  useEffect(() => {
    let mounted = true;
    dispatch(initializeAuth()).finally(() => {
      if (mounted) setAuthReady(true);
    });
    return () => {
      mounted = false;
    };
  }, [dispatch]);

  useEffect(() => {
    let cancelled = false;

    const verifyPaymentAndEnrollment = async () => {
      if (!authReady) return;

      if (!orderId) {
        if (!cancelled) setVerifying(false);
        return;
      }

      // Retry briefly because webhook and provider callbacks can arrive a bit later.
      for (let attempt = 1; attempt <= 5; attempt++) {
        if (cancelled) return;

        try {
          const response = await axiosClient.post(
            `/formation/orders/${orderId}/confirm-payment/`,
            {},
            { skipAuthRedirect: true } as any,
          );
          if (response.status === 200) {
            if (!cancelled) {
              setVerificationMsg("Enrollment confirmed. Redirecting...");
              setVerifying(false);
            }
            return;
          }
        } catch (error: any) {
          const status = error?.status ?? error?.response?.status;
          if (status === 401 || status === 403) {
            if (!cancelled) {
              setVerificationMsg(
                "Payment received. Enrollment is being finalized.",
              );
              setVerifying(false);
            }
            return;
          }
          // Keep retrying a few times; webhook might still be processing.
        }

        setVerificationMsg(`Finalizing payment... (${attempt}/5)`);
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      if (!cancelled) {
        setVerificationMsg(
          "Payment received. Enrollment may take a few seconds.",
        );
        setVerifying(false);
      }
    };

    verifyPaymentAndEnrollment();
    return () => {
      cancelled = true;
    };
  }, [authReady, orderId]);

  // Auto-redirect after verification attempts complete.
  useEffect(() => {
    if (courseSlug && !verifying) {
      const timer = setTimeout(() => {
        router.push(`/courses/${courseSlug}`);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [courseSlug, verifying, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-oxford p-4">
      <div className="bg-white dark:bg-oxford-light rounded-2xl shadow-xl border border-gray-200 dark:border-white/10 p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircleIcon className="w-10 h-10 text-emerald-500" />
        </div>

        <h1 className="text-2xl font-bold text-oxford dark:text-white mb-3">
          Payment Successful!
        </h1>

        <p className="text-silver dark:text-gray-400 mb-2">
          Your payment has been processed successfully.
        </p>
        <p className="text-silver dark:text-gray-400 mb-8">{verificationMsg}</p>

        {orderId && (
          <p className="text-xs text-silver dark:text-gray-500 mb-6">
            Order: <span className="font-mono">{orderId}</span>
          </p>
        )}

        <div className="flex flex-col gap-3">
          {courseSlug ? (
            <Link
              href={`/courses/${courseSlug}`}
              className="w-full py-3 bg-gold hover:bg-gold/90 text-oxford font-semibold rounded-xl transition-colors text-sm text-center"
            >
              Go to Course
            </Link>
          ) : (
            <Link
              href="/dashboard"
              className="w-full py-3 bg-gold hover:bg-gold/90 text-oxford font-semibold rounded-xl transition-colors text-sm text-center"
            >
              Go to Dashboard
            </Link>
          )}
          <Link
            href="/"
            className="w-full py-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-oxford dark:text-white font-medium rounded-xl transition-colors text-sm text-center"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
