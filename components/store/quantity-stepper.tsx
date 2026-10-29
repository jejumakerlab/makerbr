"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuantityStepper({
  value,
  max,
  onChange,
  label,
  size = "md",
  disabled,
}: {
  value: number;
  max: number;
  onChange: (value: number) => void;
  /** 스크린리더용 이름, 예) "현무암 코스터 수량" */
  label: string;
  size?: "sm" | "md";
  disabled?: boolean;
}) {
  const atMin = value <= 1;
  const atMax = value >= max;
  const buttonClass = cn(
    "flex items-center justify-center text-slate-600 transition-colors hover:bg-slate-100 hover:text-[#0f4c3a] disabled:pointer-events-none disabled:opacity-35",
    size === "sm" ? "size-8" : "size-11",
  );

  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "inline-flex items-center overflow-hidden rounded-full border border-slate-200 bg-white",
        disabled && "opacity-50",
      )}
    >
      <button
        type="button"
        className={buttonClass}
        onClick={() => onChange(value - 1)}
        disabled={disabled || atMin}
        aria-label="수량 줄이기"
      >
        <Minus className="size-4" aria-hidden="true" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={max}
        value={value}
        disabled={disabled}
        aria-label="수량"
        onChange={(event) => {
          const next = Number(event.target.value);
          if (Number.isFinite(next) && next >= 1) onChange(Math.min(next, max));
        }}
        className={cn(
          "[appearance:textfield] border-x border-slate-200 bg-transparent text-center font-semibold tabular-nums outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          size === "sm" ? "h-8 w-10 text-sm" : "h-11 w-14 text-base",
        )}
      />
      <button
        type="button"
        className={buttonClass}
        onClick={() => onChange(value + 1)}
        disabled={disabled || atMax}
        aria-label="수량 늘리기"
      >
        <Plus className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
