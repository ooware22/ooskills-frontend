"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ReceiptPercentIcon } from "@heroicons/react/24/outline";
import StudentHeader from "@/components/student/StudentHeader";
import axiosClient from "@/lib/axios";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * "My orders" (audit FN-12 / UX-24): every order of the logged-in learner,
 * including pending ones, which were visible nowhere before.
 */

type OrderStatus = "pending" | "paid" | "failed" | "refunded";

interface OrderItem {
  id: string;
  course_slug: string;
  course_title: string;
  price: number | string;
}

interface Order {
  id: string;
  total: number | string;
  status: OrderStatus;
  paymentMethod: string;
  checkout_url: string;
  items: OrderItem[];
  created_at: string;
}

interface Page<T> {
  count: number;
  next: string | null;
  results: T[];
}

const STATUS_STYLE: Record<OrderStatus, string> = {
  paid: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  pending: "bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300",
  failed: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  refunded: "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-white/70",
};

export default function MyOrdersPage() {
  const { t, locale } = useI18n();
  const to = (key: string) => t(`student.orders.${key}`);
  const dateLocale = locale === "ar" ? "ar-DZ" : locale === "en" ? "en-GB" : "fr-FR";

  const [orders, setOrders] = useState<Order[]>([]);
  const [next, setNext] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async (pageNumber: number) => {
    setLoading(true);
    setError(false);
    try {
      const { data } = await axiosClient.get<Page<Order>>(`/formation/orders/?page=${pageNumber}`);
      setOrders((prev) => (pageNumber === 1 ? data.results : [...prev, ...data.results]));
      setNext(data.next);
      setPage(pageNumber);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(1);
  }, [load]);

  const money = (value: number | string) =>
    `${Number(value).toLocaleString(dateLocale)} DA`;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <StudentHeader titleKey="student.orders.title" subtitleKey="student.orders.subtitle" />

      <div className="flex-1 overflow-y-auto p-6">
        {error && (
          <div role="alert" className="mb-4 p-4 rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 text-sm text-red-700 dark:text-red-300 flex items-center justify-between gap-3">
            <span>{to("error")}</span>
            <button type="button" onClick={() => load(1)} className="font-semibold underline">
              {to("retry")}
            </button>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-16">
            <ReceiptPercentIcon className="w-10 h-10 mx-auto mb-3 text-silver" aria-hidden="true" />
            <p className="text-sm text-gray-700 dark:text-white/70 mb-4">{to("empty")}</p>
            <Link
              href="/courses"
              className="inline-block px-5 py-2.5 bg-gold hover:bg-gold-light text-oxford rounded-lg text-sm font-medium"
            >
              {to("browse")}
            </Link>
          </div>
        )}

        <ul className="space-y-4">
          {orders.map((order, index) => (
            <motion.li
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index, 8) * 0.03 }}
              className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-xs text-gray-600 dark:text-white/60">
                    {new Date(order.created_at).toLocaleDateString(dateLocale, {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                    {" · "}
                    {to("reference")} {order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-lg font-bold text-oxford dark:text-white">{money(order.total)}</p>
                </div>
                <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", STATUS_STYLE[order.status])}>
                  {to(`status.${order.status}`)}
                </span>
              </div>

              <ul className="text-sm divide-y divide-gray-100 dark:divide-white/5 mb-3">
                {order.items.map((item) => (
                  <li key={item.id} className="py-2 flex items-center justify-between gap-3">
                    <Link
                      href={`/courses/${item.course_slug}`}
                      className="text-oxford dark:text-white hover:text-gold truncate"
                    >
                      {item.course_title}
                    </Link>
                    <span className="text-gray-600 dark:text-white/60 whitespace-nowrap">{money(item.price)}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-gray-600 dark:text-white/60">
                  {to("method")} {to(`methods.${order.paymentMethod}`)}
                </p>
                {order.status === "pending" && (
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/payment/success?order=${order.id}`}
                      className="px-4 py-2 rounded-lg border border-gray-300 dark:border-white/20 text-sm text-oxford dark:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                    >
                      {to("checkStatus")}
                    </Link>
                    {order.checkout_url && (
                      <a
                        href={order.checkout_url}
                        className="px-4 py-2 rounded-lg bg-gold hover:bg-gold-light text-oxford text-sm font-medium"
                      >
                        {to("pay")}
                      </a>
                    )}
                  </div>
                )}
              </div>
            </motion.li>
          ))}
        </ul>

        {loading && (
          <p role="status" className="text-center text-sm text-gray-600 dark:text-white/60 py-6">
            {to("loading")}
          </p>
        )}

        {!loading && next && (
          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => load(page + 1)}
              className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-white/20 text-sm text-oxford dark:text-white hover:bg-gray-50 dark:hover:bg-white/5"
            >
              {to("more")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
