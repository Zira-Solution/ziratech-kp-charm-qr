"use client";

import React, { useEffect, useRef, useState } from "react";
import { fieldClass, Icon } from "./ui";
import { isValidDate, toIso, isoToDisplay, parseUserDate } from "@/lib/date-utils";

export { isValidDate, toIso, isoToDisplay, parseUserDate };

interface Props {
  id?: string;
  value: string; // ISO date: YYYY-MM-DD (or "")
  onChange: (isoDate: string) => void;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
  min?: string;
  max?: string;
}

export default function SmartDateInput({
  id,
  value,
  onChange,
  placeholder = "dd/mm/yyyy (ví dụ: 20/10/2023)",
  className = "",
  ariaLabel = "Ngày",
  min = "1900-01-01",
  max = "2100-12-31",
}: Props) {
  const [displayText, setDisplayText] = useState(() => (value ? isoToDisplay(value) : ""));
  const pickerRef = useRef<HTMLInputElement>(null);

  // Sync when value changes from outside (e.g. preset button clicked, or reset)
  useEffect(() => {
    if (value) {
      const formatted = isoToDisplay(value);
      if (parseUserDate(displayText) !== value) {
        setDisplayText(formatted);
      }
    } else if (!displayText.trim()) {
      setDisplayText("");
    }
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setDisplayText(raw);

    if (!raw.trim()) {
      onChange("");
      return;
    }

    const parsed = parseUserDate(raw);
    if (parsed) {
      onChange(parsed);
    }
  };

  const handleBlur = () => {
    if (!displayText.trim()) {
      onChange("");
      return;
    }

    const parsed = parseUserDate(displayText);
    if (parsed) {
      onChange(parsed);
      setDisplayText(isoToDisplay(parsed));
    }
  };

  const openPicker = () => {
    if (pickerRef.current) {
      if (typeof pickerRef.current.showPicker === "function") {
        pickerRef.current.showPicker();
      } else {
        pickerRef.current.click();
      }
    }
  };

  const isInvalid = displayText.trim() !== "" && parseUserDate(displayText) === null;

  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={displayText}
          onChange={handleTextChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          aria-label={ariaLabel}
          className={`${fieldClass} pr-11 font-mono sm:font-sans ${
            isInvalid ? "border-amber-400 focus:ring-amber-200" : ""
          } ${className}`}
        />

        {/* Calendar Picker Trigger Button */}
        <button
          type="button"
          onClick={openPicker}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-rose-50 hover:text-[#721a28] transition-colors cursor-pointer"
          title="Chọn ngày từ lịch"
          aria-label="Mở lịch chọn ngày"
        >
          <Icon name="calendar_month" className="text-[20px]" />
        </button>

        {/* Hidden Native Date Input for Picker Dialog */}
        <input
          ref={pickerRef}
          type="date"
          tabIndex={-1}
          min={min}
          max={max}
          value={value || ""}
          onChange={(e) => {
            const picked = e.target.value;
            onChange(picked);
            if (picked) {
              setDisplayText(isoToDisplay(picked));
            }
          }}
          className="sr-only absolute pointer-events-none opacity-0"
        />
      </div>

      {isInvalid && (
        <p className="mt-1 text-[11px] text-amber-600 font-medium animate-fade-in flex items-center gap-1">
          <Icon name="info" className="text-[14px]" />
          <span>Vui lòng gõ theo dạng: ngày/tháng/năm (ví dụ: 20/10/2023)</span>
        </p>
      )}
    </div>
  );
}
