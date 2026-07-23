import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * HaloButton (design.md §8.5).
 * Primary: mono 12px uppercase ls 0.18em, 1px steel border, 10px 20px, bone.
 * Hover: border→halo, bg halo-soft, text halo, 2px glow. Press: scale 0.97.
 * Secondary: borderless, ash→halo with an arrow that translates 4px.
 */
export const HaloButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary";
    arrow?: boolean;
    children: ReactNode;
  }
>(({ variant = "primary", arrow = false, className, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      data-cursor="link"
      data-magnetic
      className={cn(
        "group inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.18em] transition-all duration-200 ease-compile-out active:scale-[0.97]",
        variant === "primary" &&
          "rounded-[2px] border border-steel bg-transparent px-5 py-2.5 text-bone hover:border-halo hover:bg-halo-soft hover:text-halo hover:shadow-halo-ring",
        variant === "secondary" && "border-none bg-transparent px-1 py-1 text-ash hover:text-halo",
        className,
      )}
      {...props}
    >
      <span>{children}</span>
      {(arrow || variant === "secondary") && (
        <span
          aria-hidden
          className="inline-block transition-transform duration-200 ease-compile-out group-hover:translate-x-1"
        >
          →
        </span>
      )}
    </button>
  );
});
HaloButton.displayName = "HaloButton";
