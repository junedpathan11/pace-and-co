"use client";

import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

const CONTROL =
  "min-h-11 w-full rounded-chip border bg-surface px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted/70 focus:border-ink focus-visible:ring-2 focus-visible:ring-primary";

function controlClass(invalid: boolean): string {
  return `${CONTROL} ${invalid ? "border-primary" : "border-border"}`;
}

function Shell({
  id,
  label,
  optional,
  error,
  hint,
  children,
  className = "",
}: {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="eyebrow mb-1.5 block">
        {label}
        {optional && <span className="ml-1 normal-case tracking-normal">(optional)</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={`${id}-error`}
          className="mt-1.5 text-xs font-medium text-primary"
        >
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Labelled text input wired for accessible validation: aria-invalid flips on
 * error and aria-describedby points at the visible message (or the hint).
 */
export function TextField({
  id,
  label,
  error,
  hint,
  optional,
  className,
  ...props
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  className?: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  const describedBy = error
    ? `${id}-error`
    : hint
      ? `${id}-hint`
      : undefined;
  return (
    <Shell
      id={id}
      label={label}
      error={error}
      hint={hint}
      optional={optional}
      className={className}
    >
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={controlClass(!!error)}
        {...props}
      />
    </Shell>
  );
}

export function SelectField({
  id,
  label,
  error,
  hint,
  options,
  placeholder,
  className,
  ...props
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  options: readonly string[];
  placeholder?: string;
  className?: string;
} & SelectHTMLAttributes<HTMLSelectElement>) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <Shell id={id} label={label} error={error} hint={hint} className={className}>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={controlClass(!!error)}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </Shell>
  );
}
