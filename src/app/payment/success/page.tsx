"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("order");
  const courseSlug = searchParams.get("course");

  // Auto-redirect to the course page after 3 seconds
  useEffect(() => {
    if (courseSlug) {
      const timer = setTimeout(() => {
        router.push(`/courses/${courseSlug}`);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [courseSlug, router]);

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
        <p className="text-silver dark:text-gray-400 mb-8">
          You are now enrolled in the course. Redirecting...
        </p>

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
