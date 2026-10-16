"use client";

import React from "react";
import { daysSince } from "../../studio/draft";
import { anniversaryText, formatDateVi } from "./format";

interface Props {
  date: string;
  label: string;
  className?: string;
}

/** "Ngày yêu: đã 365 ngày", with the date under it. Counts from the visitor's own today. */
export default function AnniversaryCounter({ date, label, className = "" }: Props) {
  const days = daysSince(date);
  return (
    <div className={className}>
      <p className="text-lg font-bold">{anniversaryText(days, label)}</p>
      <p className="text-sm opacity-75">
        <time dateTime={date}>{formatDateVi(date)}</time>
      </p>
    </div>
  );
}
