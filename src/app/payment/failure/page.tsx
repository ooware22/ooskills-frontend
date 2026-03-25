"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export default function PaymentFailurePage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-oxford p-4">
      <div className="bg-white dark:bg-oxford-light rounded-2xl shadow-xl border border-gray-200 dark:border-white/10 p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <ExclamationTriangleIcon className="w-10 h-10 text-red-500" />
        </div>

        <h1 className="text-2xl font-bold text-oxford dark:text-white mb-3">
          Payment Failed
        </h1>

        <p className="text-silver dark:text-gray-400 mb-2">
          Your payment could not be completed.
        </p>
        <p className="text-silver dark:text-gray-400 mb-8">
          No charges were made. Please try again or contact support if the issue persists.
        </p>

        {orderId && (
          <p className="text-xs text-silver dark:text-gray-500 mb-6">
            Order: <span className="font-mono">{orderId}</span>
          </p>
        )}

        <div className="flex flex-col gap-3">
          <Link
            href="/courses"
            className="w-full py-3 bg-gold hover:bg-gold/90 text-oxford font-semibold rounded-xl transition-colors text-sm text-center"
          >
            Try Again
          </Link>
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
