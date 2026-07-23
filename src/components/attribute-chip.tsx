import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * AttributeChip (design.md §8.4) — the site's signature nav/link atom.
 * Format `#[name]` or `#[name(arg)]`, halo text, dashed 1px steel-soft box;
 * hover triggers halo cursor `#[expand]`; active = solid halo-soft chip.
 * Idle: subtle 6s halo-pulse (stagger via `pulseDelay`).
 */
export const AttributeChip = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & {
    name: string;
    arg?: string;
    active?: boolean;
    pulseDelay?: number;
  }
>(({ name, arg, active = false, pulseDelay = 0, className, style, ...props }, ref) => {
  return (
    <button
      ref={ref}
      data-cursor="expand"
      className={cn(
        "inline-flex items-baseline rounded-[2px] border border-dashed border-steel-soft px-1.5 py-0.5 font-mono text-halo transition-colors duration-200 ease-compile-out",
        "hover:border-halo hover:bg-halo-soft",
        active && "border-solid border-halo bg-halo-soft",
        className,
      )}
      style={{ animation: `halo-pulse 6s ease-in-out ${pulseDelay}s infinite`, ...style }}
      {...props}
    >
      <span>#[{name}</span>
      {arg && <span className="text-ash">({arg})</span>}
      <span>]</span>
    </button>
  );
});
AttributeChip.displayName = "AttributeChip";
