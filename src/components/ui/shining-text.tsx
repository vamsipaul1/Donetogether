import * as React from "react";

import { cn } from "@/lib/utils";

type ShiningTextProps = {
  text: string;
  className?: string;
};

export function ShiningText({ text, className }: ShiningTextProps) {
  return (
    <span
      className={cn(
        "inline-block bg-[length:200%_100%] bg-clip-text text-transparent",
        "bg-gradient-to-r from-zinc-400 via-zinc-900 to-zinc-400",
        "dark:from-zinc-500 dark:via-white dark:to-zinc-500",
        "animate-[shimmer_1.4s_linear_infinite]",
        className
      )}
      aria-label={text}
    >
      {text}
    </span>
  );
}
